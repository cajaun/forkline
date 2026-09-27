from __future__ import annotations

import unittest

import chess
from fastapi import HTTPException

from server.api import routes as api
from server.chess.agents import AGENT_NAMES, create_agent
from server.chess.reference import ReferenceAgent
from server.matches.harness import play_game, run_match
from server.chess.search import MinimaxAlphaBeta
from server.chess.evaluation import KingSafetyEvaluator, MaterialMobilityEvaluator


class BackendTests(unittest.TestCase):
    def setUp(self) -> None:
        api.games.clear()
        api.matches.clear()

    def test_search_returns_a_legal_move(self) -> None:
        board = chess.Board()
        starting_fen = board.fen()
        result = MinimaxAlphaBeta(MaterialMobilityEvaluator()).choose_move(board, depth=2)
        self.assertIn(result.move, board.legal_moves)
        self.assertEqual(board.fen(), starting_fen)
        self.assertGreater(result.stats.nodes, 0)
        self.assertGreaterEqual(result.stats.cutoffs, 0)

    def test_reference_agent_returns_a_legal_move(self) -> None:
        board = chess.Board()
        result = ReferenceAgent().choose_move(board)
        self.assertIn(result.move, board.legal_moves)
        self.assertGreater(result.stats.nodes, 0)

    def test_each_agent_can_play_against_the_reference_player(self) -> None:
        # exercise both evaluators against the same deterministic opponent
        for agent_name in AGENT_NAMES:
            result = play_game(
                create_agent(agent_name, depth=1),
                ReferenceAgent(),
                max_plies=4,
            )
            self.assertEqual(len(result.moves), 4)

    def test_agents_have_distinct_evaluators(self) -> None:
        self.assertEqual(len(AGENT_NAMES), 2)
        self.assertNotEqual(
            type(create_agent(AGENT_NAMES[0]).evaluator),
            type(create_agent(AGENT_NAMES[1]).evaluator),
        )
        self.assertIsInstance(create_agent(AGENT_NAMES[0]).evaluator, MaterialMobilityEvaluator)
        self.assertIsInstance(create_agent(AGENT_NAMES[1]).evaluator, KingSafetyEvaluator)

    def test_match_alternates_colors_and_logs_moves(self) -> None:
        report = run_match(games=2, depth=1, max_plies=4)
        results = report["results"]
        self.assertEqual(report["games"], 2)
        self.assertEqual(results[0]["white_agent"], AGENT_NAMES[0])
        self.assertEqual(results[1]["white_agent"], AGENT_NAMES[1])
        self.assertEqual(len(results[0]["moves"]), 4)
        self.assertEqual(len(results[1]["moves"]), 4)
        self.assertIn("nodes", results[0]["moves"][0])

    def test_api_session_accepts_human_then_agent_move(self) -> None:
        created = api.create_game(
            api.CreateGameRequest(
                agent="material-mobility",
                human_color="white",
                depth=1,
            )
        )
        self.assertEqual(len(created["legal_moves"]), 20)

        after_human = api.submit_human_move(
            created["game_id"], api.MoveRequest(uci="e2e4")
        )
        self.assertEqual(after_human["turn"], "black")

        after_agent = api.request_ai_move(created["game_id"])
        self.assertEqual(after_agent["turn"], "white")
        self.assertIn("search", after_agent)

    def test_illegal_human_move_does_not_change_the_game(self) -> None:
        # verify validation preserves the session snapshot
        created = api.create_game(api.CreateGameRequest(depth=1))
        before = api.get_game(created["game_id"])

        with self.assertRaises(HTTPException) as context:
            api.submit_human_move(created["game_id"], api.MoveRequest(uci="e2e5"))

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(api.get_game(created["game_id"])["fen"], before["fen"])

    def test_black_human_can_wait_for_the_agent_then_move(self) -> None:
        created = api.create_game(
            api.CreateGameRequest(human_color="black", depth=1)
        )
        api.request_ai_move(created["game_id"])
        moved = api.submit_human_move(
            created["game_id"], api.MoveRequest(uci="e7e5")
        )
        self.assertEqual(moved["turn"], "white")

    def test_agent_match_session_can_step_and_report_both_players(self) -> None:
        created = api.create_match_session(
            api.CreateMatchSessionRequest(depth=1)
        )
        self.assertEqual(created["mode"], "agent-vs-agent")
        self.assertEqual(created["players"]["white"], AGENT_NAMES[0])
        self.assertEqual(created["players"]["black"], AGENT_NAMES[1])

        stepped = api.step_match_session(created["match_id"])
        self.assertEqual(len(stepped["moves"]), 1)
        self.assertIn("search", stepped)
        self.assertTrue(api.delete_match_session(created["match_id"])["deleted"])


if __name__ == "__main__":
    unittest.main()

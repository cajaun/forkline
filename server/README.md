# Forkline chess backend

This backend contains the assignment-critical Python implementation:

- a shared `python-chess` game state;
- Minimax with Alpha-Beta pruning;
- two deliberately different evaluation strategies;
- an agent-vs-agent match harness; and
- a small FastAPI adapter for the React Native app.

The server is organized by responsibility:

- `chess/` contains the game agents, evaluation functions, and search engine.
- `matches/` contains match orchestration and result logging.
- `api/` contains the HTTP transport layer only.

## Setup

From the repository root:

```bash
python3 -m venv server/.venv
source server/.venv/bin/activate
python -m pip install -r server/requirements.txt
```

## Run the tests

```bash
python -m unittest discover -s server/tests -t . -v
```

## Run a five-game match

```bash
python -m server.matches.harness --games 5 --depth 2 --output server/match-results.json
```

The match alternates which agent receives White and records every move, FEN,
result, and termination reason.

## Run the API

```bash
python -m uvicorn server.api.routes:app --reload --port 8000
```

The React Native client can use `http://localhost:8000` from the iOS
Simulator. A physical device must use the development machine's LAN IP.

The initial API surface is:

- `POST /games` creates a human-vs-agent session and returns FEN plus legal
  UCI moves.
- `POST /games/{id}/moves` submits the human's UCI move.
- `POST /games/{id}/ai-move` advances the agent and returns search statistics.
- `GET /games/{id}` reads the current state.
- `DELETE /games/{id}` releases a human game session.
- `GET /agents` returns the selectable agent strategies.
- `POST /matches/sessions` creates a stepwise agent-vs-agent session.
- `POST /matches/sessions/{id}/step` advances one agent move.
- `POST /matches` runs the assignment's agent-vs-agent harness.

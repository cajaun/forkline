# Forkline

Forkline is a chess app for the COMP3220 Minimax assignment. You play against one of two AI agents, or you watch the two agents play each other. A React Native app on your phone draws the board, and a Python server runs the agents with `python-chess`.

## Author

Cajaun Campbell completed this assignment alone, and built both agents: Material + Mobility and King Safety + Position. The two agents share one Minimax search with Alpha-Beta pruning and differ in their evaluation functions. [`docs/agents.md`](docs/agents.md) explains the search and compares the two strategies. [`docs/match-report.md`](docs/match-report.md) gives the results of the agent-vs-agent matches.

## Getting the app

You can install Forkline on an iPhone through TestFlight. Install Apple's TestFlight app from the App Store, then open [the Forkline TestFlight invite](https://testflight.apple.com/join/KBDpYHnQ) on your iPhone and tap Accept. If you don't have an iPhone, the demo videos below show both modes, and Local setup explains how to run the app on a simulator.

## Playing the two modes

The app asks the chess server for each AI move and each hint. The committed `client/.env` file points the app at the hosted server on Render, so you can play without running a server yourself. To play against a server on your own machine, follow Local setup below.

1. Tap Play on today's game to open the board.
2. Tap the gear, then Game, then Game mode.
3. Choose **Human vs AI** to play against an agent. Pick your colour under Play as and your opponent under AI strategy.
4. Choose **AI vs AI** to watch the two agents play each other. The board updates after each move.
5. Under Gameplay, set each agent's search depth from 1 to 5.

If you change the mode or your colour during a game, Forkline starts a new game.

## Demo videos

Forkline runs as an iOS app. These recordings let you see both modes without an iPhone. The first video joins all six clips, with a title card before each one, and each clip after it covers one part of the app.

https://github.com/user-attachments/assets/67064d14-69be-4cf0-a268-2c01bed25b5a

### Getting started

https://github.com/user-attachments/assets/1f6ef792-c98c-42e6-ab3c-778c69ab8a9b

On first launch you choose how to play and how far each AI looks ahead.

### Human vs AI

https://github.com/user-attachments/assets/ce0d8633-db25-4689-9a32-cc8df2fc0d13

You play White against Material + Mobility. Settings swaps in King Safety + Position and sets each agent's search depth.

### Finishing a game

https://github.com/user-attachments/assets/5c53d200-e208-475c-8905-85a3eed70b3e

You checkmate the depth 1 agent in 40 moves, and the result screen shows your time and moves.

### AI vs AI

https://github.com/user-attachments/assets/855b4334-df32-490e-a1fb-e5e1e8f17728

The two agents play each other live at depth 1. King Safety + Position takes White, and the game ends in a draw by repetition after 59 moves.

### The AI tray

https://github.com/user-attachments/assets/dfdff48f-fefb-4055-9f47-fee8e69e6d54

The brain button on the home screen explains what each agent scores and shows the harness matches at depth 2 and depth 3.

### Your stats

https://github.com/user-attachments/assets/ba6e9a87-1265-425b-af89-53d2f23471f7

The stats tray counts your games against the AI, and the question mark on each card explains its numbers.

## Source map

| Area | Start here |
| --- | --- |
| App screens | [`client/app/`](client/app/) |
| App components | [`client/components/`](client/components/) |
| App state and hooks | [`client/stores/`](client/stores/) and [`client/hooks/`](client/hooks/) |
| Game sheet and board | [`client/components/sheet/`](client/components/sheet/), with the board layers in [`board/`](client/components/sheet/board/) |
| Server quickstart | [`server/README.md`](server/README.md) |
| API routes | [`server/api/routes.py`](server/api/routes.py), with request bodies in [`schemas.py`](server/api/schemas.py) and error handling in [`responses.py`](server/api/responses.py) |
| Game sessions | [`server/chess/game.py`](server/chess/game.py) |
| Agents | [`server/chess/agents.py`](server/chess/agents.py) |
| Evaluation functions | [`server/chess/evaluation.py`](server/chess/evaluation.py), with the piece-square tables in [`piece_squares.py`](server/chess/piece_squares.py) |
| Minimax search | [`server/chess/search.py`](server/chess/search.py) |
| Reference agent | [`server/chess/reference.py`](server/chess/reference.py) |
| Match harness | [`server/matches/harness.py`](server/matches/harness.py) |
| Server tests | [`server/tests/test_backend.py`](server/tests/test_backend.py) |

## How the parts fit

~~~text
React Native app
  |
  | HTTP
  v
FastAPI chess server
  |
  +--> GameSession -> python-chess board and legal moves
  +--> Minimax with Alpha-Beta pruning
  +--> Material + Mobility agent
  +--> King Safety + Position agent
  +--> In-memory session stores
  +--> Match harness and JSON reports
~~~

The app stores your games on your phone and asks the server for moves and hints. The server keeps its sessions in memory and loses them when it restarts. To resume a saved game, the app sends the game's moves back to the server, and the server replays them.

## Local setup

You need Node.js for the app and Python 3.11 or later for the server.

Install the app's packages and start Expo:

~~~bash
cd client
npm install
npm run start
~~~

To build and run on a specific platform, use `npm run ios`, `npm run android` or `npm run web`.

From the repository root, create the server's environment:

~~~bash
python3 -m venv server/.venv
server/.venv/bin/python -m pip install -r server/requirements.txt
~~~

In a second terminal, start the server from the repository root:

~~~bash
server/.venv/bin/python -m uvicorn server.api.routes:app --reload --host 0.0.0.0 --port 8000
~~~

The server listens on `http://localhost:8000`.

To point the app at your local server, remove the `EXPO_PUBLIC_API_URL` line from `client/.env`. The app then uses `http://localhost:8000` on iOS and web, and `http://10.0.2.2:8000` on the Android emulator. On a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN address, such as `http://192.168.1.20:8000`. Restart Expo after you change `client/.env`. The hosted server runs at `https://forkline-n04p.onrender.com`.

## API

The server offers these routes:

~~~text
GET    /health
GET    /agents
POST   /games
GET    /games/{game_id}
DELETE /games/{game_id}
POST   /games/{game_id}/moves
POST   /games/{game_id}/ai-move
POST   /games/{game_id}/hint
POST   /matches/sessions
GET    /matches/sessions/{match_id}
DELETE /matches/sessions/{match_id}
POST   /matches/sessions/{match_id}/step
POST   /matches
~~~

Send human moves in UCI notation, such as `e2e4`. You can pass an optional FEN starting position and an optional `moves` list in UCI when you create a game or a match. The app uses that list to resume a saved game, and the server answers 422 if a move in it is illegal. The request models cap search depth at 5 for games and at 4 for a full harness match.

## Configuration

The server reads one environment variable:

- `FORKLINE_CORS_ORIGINS`: a comma-separated list of allowed origins. It defaults to `*`.

Example:

~~~bash
FORKLINE_CORS_ORIGINS=http://localhost:8081 \
  server/.venv/bin/python -m uvicorn server.api.routes:app --reload
~~~

The server keeps active games and match sessions in memory. It saves no users, games, moves or reports between restarts.

## Tests and checks

Run the server tests:

~~~bash
server/.venv/bin/python -m unittest discover -s server/tests -t . -v
~~~

Check that every server file compiles:

~~~bash
server/.venv/bin/python -m compileall server
~~~

Run the app's type check and linter:

~~~bash
cd client
npx tsc --noEmit
npm run lint
~~~

## Running a match

Run a ten-game match between the two agents and print its JSON report:

~~~bash
server/.venv/bin/python -m server.matches.harness --games 10 --depth 2 --max-plies 300
~~~

The harness holds ten named openings. Games 1 and 2 start from the first opening, games 3 and 4 from the second, and so on. The agents swap colours between the two games of each pair, so a ten-game match covers five openings. The report lists each game's opening, result and moves, along with the average number of positions each agent searched and branches it pruned per move.

The repository keeps the full depth 2 and depth 3 reports in [`server/reports/`](server/reports). The app's AI tray, behind the brain button on the home screen, shows a summary of each. After you change an agent, rerun a match and refresh both files:

~~~bash
server/.venv/bin/python -m server.matches.harness --games 10 --depth 3 \
  --output server/reports/match-depth-3.json \
  --summary client/constants/match-report-depth-3.json
~~~

## Repository layout

~~~text
client/                 Expo React Native app
  app/                  Expo Router screens
  components/           Board, sheet, tray and shared UI components
  constants/            App settings, colours and match summaries
  hooks/                Reusable hooks
  stores/               App state
  types/                Shared types
  utils/                Game and layout helpers
server/                 Python chess server
  api/                  FastAPI routes and session storage
  chess/                Game state, agents, evaluation and search
  matches/              Match runner and report writer
  reports/              Saved match reports
  tests/                Server tests
docs/                   Search, strategy and match report write-ups
~~~

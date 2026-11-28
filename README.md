# Forkline

Forkline is a React Native chess application with a Python backend. The client
provides the animated chess sheet and interactive board. The server provides
the shared `python-chess` game state, two Minimax agents with Alpha-Beta
pruning, human-vs-agent games, and agent-vs-agent matches.

## Author

Cajaun Campbell (620169526) completed this assignment alone and built both agents: Material + Mobility and King Safety + Position. The two agents share one Minimax search and differ in their evaluation functions. [`docs/agents.md`](docs/agents.md) explains the search and compares the strategies, and [`docs/match-report.md`](docs/match-report.md) covers the agent-vs-agent results.

## Playing the two modes

The app talks to the chess server for every AI move, so start the server first (see Local Development) or point the app at the hosted copy.

1. Tap Play on today's game to open the board.
2. Tap the gear, then Game, then Game mode.
3. Pick **Human vs AI** to play against an agent. Choose your colour under Play as and the agent under AI strategy.
4. Pick **AI vs AI** to watch the two agents play each other. The board updates after each move.
5. Under Gameplay, set the search depth for each agent from 1 to 5.

Changing the mode or colour of a game in progress starts a new game.

## Demo videos

https://github.com/user-attachments/assets/67064d14-69be-4cf0-a268-2c01bed25b5a

The GUI runs as an iOS app, so these recordings show both modes without an iPhone. joins all six clips with a title card before each one. Each clip below also stands on its own.

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
| Client application | [`client/app/`](client/app/) |
| Client components | [`client/components/`](client/components/) |
| Client state and hooks | [`client/stores/`](client/stores/) and [`client/hooks/`](client/hooks/) |
| Game sheet and board | [`client/components/sheet/`](client/components/sheet/), with the board layers in [`board/`](client/components/sheet/board/) |
| Server quickstart | [`server/README.md`](server/README.md) |
| API routes | [`server/api/routes.py`](server/api/routes.py), with request bodies in [`schemas.py`](server/api/schemas.py) and error mapping in [`responses.py`](server/api/responses.py) |
| Game sessions | [`server/chess/game.py`](server/chess/game.py) |
| Agents and evaluators | [`server/chess/agents.py`](server/chess/agents.py) and [`server/chess/evaluation.py`](server/chess/evaluation.py) |
| Search engine | [`server/chess/search.py`](server/chess/search.py) |
| Match harness | [`server/matches/harness.py`](server/matches/harness.py) |
| Backend tests | [`server/tests/test_backend.py`](server/tests/test_backend.py) |

## Runtime Shape

~~~text
React Native client
  |
  | HTTP integration boundary
  v
FastAPI chess server
  |
  +--> GameSession -> python-chess board and legal move state
  +--> Minimax + Alpha-Beta search
  +--> Material-mobility agent
  +--> King-safety-position agent
  +--> In-memory session stores
  +--> Match harness and JSON reports
~~~

The client asks the server for each AI move and hint, and stores your games on the device. The server keeps sessions in memory, so they reset when the process stops, and the client replays a saved game's moves to resume it.

## Local Development

Create the client dependencies:

~~~bash
cd client
npm install
~~~

Start the Expo client:

~~~bash
npm run start
~~~

Use `npm run ios`, `npm run android`, or `npm run web` when you want a specific
target.

Create the server environment from the repository root:

~~~bash
python3 -m venv server/.venv
server/.venv/bin/python -m pip install -r server/requirements.txt
~~~

Start the API from the repository root in another terminal:

~~~bash
server/.venv/bin/python -m uvicorn server.api.routes:app --reload --host 0.0.0.0 --port 8000
~~~

The API is available at:

~~~text
http://localhost:8000
~~~

The client uses `http://localhost:8000` on iOS and web, and
`http://10.0.2.2:8000` on the Android emulator. For a physical device, set
`EXPO_PUBLIC_API_URL` to the machine's LAN address before starting Expo. The
hosted server lives at `https://forkline-n04p.onrender.com`, and `client/.env`
points the app there.

## API

The server exposes health, agent, human-game, and agent-match routes:

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

Human moves use UCI notation such as `e2e4`. Game and match creation accepts an
optional FEN position and an optional `moves` list (UCI) played from it, which
the client uses to resume a saved game; an illegal history is rejected with 422. Search depth is bounded by the API request models to
keep local responses predictable.

## Configuration

The API reads the following environment variable:

- `FORKLINE_CORS_ORIGINS`: comma-separated allowed origins, defaulting to `*`

Example:

~~~bash
FORKLINE_CORS_ORIGINS=http://localhost:8081 \
  server/.venv/bin/python -m uvicorn server.api.routes:app --reload
~~~

The server uses in-memory stores for active games and match sessions. It does
not persist users, games, moves, or match reports between process restarts.

## Tests and Quality

Run the backend test suite:

~~~bash
server/.venv/bin/python -m unittest discover -s server/tests -t . -v
~~~

Run the backend compilation check:

~~~bash
server/.venv/bin/python -m compileall server
~~~

Run the client checks:

~~~bash
cd client
npx tsc --noEmit
npm run lint
~~~

Run a ten-game agent match and print its JSON report:

~~~bash
server/.venv/bin/python -m server.matches.harness --games 10 --depth 2 --max-plies 300
~~~

The harness holds ten named openings. Games 1 and 2 start from the first, games
3 and 4 from the second, and so on, with the agents swapping colours, so a
ten-game match uses five openings. The report lists every game's opening, result
and moves, plus each agent's average nodes searched and branches pruned per move.

The full depth-2 and depth-3 reports are saved in
[`server/reports/`](server/reports), and the app shows their summaries in the AI
tray (the brain button on the home screen). To refresh one after changing an
agent:

~~~bash
server/.venv/bin/python -m server.matches.harness --games 10 --depth 3 \
  --output server/reports/match-depth-3.json \
  --summary client/constants/match-report-depth-3.json
~~~

## Repository Layout

~~~text
client/                 Expo React Native application
  app/                  Expo Router entry points
  components/           Chess, sheet, and shared UI components
  constants/            Client configuration and visual constants
  hooks/                Reusable client hooks
  stores/               Client state containers
  types/                Client domain types
  utils/                Client-side game and layout helpers
server/                 Python chess backend
  api/                  FastAPI routes and session storage
  chess/                Game state, agents, evaluation, and search
  matches/              Agent match runner and report generation
  reports/              Saved match reports
  tests/                Backend unit tests
docs/                   Search, strategy and match report write-ups
~~~

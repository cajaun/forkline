# Forkline

Forkline is a React Native chess application with a Python backend. The client
provides the animated chess sheet and interactive board. The server provides
the shared `python-chess` game state, two Minimax agents with Alpha-Beta
pruning, human-vs-agent games, and agent-vs-agent matches.

## Documentation

The repository keeps the client and server in separate packages. Use the
source references below for the detailed implementation.

| Area | Start here |
| --- | --- |
| Client application | [`client/app/`](client/app/) |
| Client components | [`client/components/`](client/components/) |
| Client state and hooks | [`client/stores/`](client/stores/) and [`client/hooks/`](client/hooks/) |
| Server quickstart | [`server/README.md`](server/README.md) |
| API routes | [`server/api/routes.py`](server/api/routes.py) |
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

The client currently runs its board experience locally. The server runs as an
independent local service and exposes the integration boundary for human games
and agent matches. Session data resets when the server process stops.

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
server/.venv/bin/uvicorn server.api.routes:app --reload --host 0.0.0.0 --port 8000
~~~

The API is available at:

~~~text
http://localhost:8000
~~~

The client uses `http://localhost:8000` on iOS and web, and
`http://10.0.2.2:8000` on the Android emulator. For a physical device, set
`EXPO_PUBLIC_API_URL` to the machine's LAN address before starting Expo.

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
POST   /matches/sessions
GET    /matches/sessions/{match_id}
DELETE /matches/sessions/{match_id}
POST   /matches/sessions/{match_id}/step
POST   /matches
~~~

Human moves use UCI notation such as `e2e4`. Game and match creation accepts an
optional FEN position. Search depth is bounded by the API request models to
keep local responses predictable.

## Configuration

The API reads the following environment variable:

- `FORKLINE_CORS_ORIGINS`: comma-separated allowed origins, defaulting to `*`

Example:

~~~bash
FORKLINE_CORS_ORIGINS=http://localhost:8081 \
  server/.venv/bin/uvicorn server.api.routes:app --reload
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

Run a five-game agent match and print its JSON report:

~~~bash
server/.venv/bin/python -m server.matches.harness --games 5 --depth 2 --max-plies 300
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
  tests/                Backend unit tests
~~~

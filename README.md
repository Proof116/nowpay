# Automatic Withdrawal (scaffold)

This workspace contains a minimal full-stack scaffold for an "automatic withdrawal" demo app.

Quick start (Windows PowerShell):

1. Install dependencies for the server:

```powershell
cd .\server
npm install
```

2. Run the server (dev):

```powershell
npm run dev
```

The server listens on port 4000 by default. The scheduler runs every minute and will process due withdrawals.

Notes:
- This is a demo scaffold. Do NOT use in production. No authentication, no input sanitization beyond basic checks, and plaintext config.
- See `server/` for API details and tests.

Docker (optional)
-----------------
You can run the server and client via Docker locally using docker-compose. This is handy when you don't want to install Node locally.

Prerequisites: Docker and docker-compose installed.

From the repository root:

```powershell
docker-compose up --build
```

This will build the `server` and `client` images and expose:
- server: http://localhost:4000
- client: http://localhost:5173

The server stores the SQLite file at `server/data.sqlite` (mounted into the container).

CI / Tests
-----------
- A basic Jest test suite is included under `server/tests/` (happy path + basic error cases).
- To run tests locally (after installing dependencies):

```powershell
cd .\server
npm install
npm test
```

If you add CI later, a simple workflow can run `npm ci && npm test` on Node 18+.

# Cowhorse Procurement System

Cowhorse is a procurement workflow application for improving employee operational efficiency. The repository is split into:

- `frontend/`: a Next.js static-export app used as the main user interface
- `api/`: an Azure Functions app used for procurement, user, and agent endpoints

The current frontend includes a dashboard landing page, purchase request views, auth pages, and a backend-ready inventory overview chart template.

## Architecture

- Frontend framework: Next.js 12, React 17, TypeScript
- Frontend styling: Tailwind CSS, ESLint, Prettier
- Backend runtime: Azure Functions for Python
- Backend storage: Azure Table Storage
- AI integration: Azure OpenAI via the backend agent endpoints
- Deployment target:
  - Frontend: Azure Static Web Apps
  - Backend: Azure Functions

## Repository Layout

```text
.
├── api/                      Azure Functions backend
│   ├── function_app.py       Function app entry point
│   ├── user.py               User registration routes
│   ├── pr.py                 Purchase requisition routes
│   ├── agent.py              Agent and AI test routes
│   └── requirements.txt      Python dependencies
├── frontend/                 Next.js frontend
│   ├── components/           Reusable UI components
│   ├── pages/                Next.js routes
│   ├── styles/               Global styles
│   ├── utils/                Static/shared frontend data
│   ├── package.json          Frontend scripts
│   └── tailwind.config.js    Tailwind configuration
└── .github/workflows/        CI and deployment workflows
```

## Prerequisites

Install the following before local development:

- Node.js 16+ and npm
- Python 3.12 recommended for the backend
- Azure Functions Core Tools if you want to run the Functions app locally

## Local Development

Run commands from the correct subdirectory. There are no repo-level scripts.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend commands:

```bash
cd frontend
npm run lint
npm run fix
npm run build
npm run start
```

Notes:

- `npm run build` runs `next build && next export`
- static export output is written to `frontend/out`
- linting is enforced with ESLint + Prettier

### Backend

```bash
cd api
python -m pip install --upgrade pip
pip install -r requirements.txt
```

To run the Azure Functions app locally:

```bash
cd api
func start
```

If your local Functions setup uses a Python virtual environment, activate it before `func start`.

## Backend Environment Variables

The backend reads configuration from environment variables. At minimum, define:

```env
AZURE_STORAGE_CONNECTION_STRING=...
```

Additional variables used by the AI/agent endpoints:

```env
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_DEPLOYMENT=...
BACKEND_BASE_URL=...
```

What they are used for:

- `AZURE_STORAGE_CONNECTION_STRING`: required by user registration and PR persistence
- `AZURE_OPENAI_API_KEY`: Azure OpenAI credential
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT`: deployed model name for chat completions
- `BACKEND_BASE_URL`: base URL used by the agent tool-calling flow

## Frontend Overview

The frontend is a static-exported Next.js app. Key routes include:

- `/`: dashboard overview and inventory/sales graph template
- `/pr`: purchase request list
- `/pr/[id]`: purchase request details
- `/login`: sign-in page
- `/register`: registration page
- `/profile`: profile page
- `/project/[path]`: example static route pages

The dashboard graph is designed as a template for backend integration and currently expects data shaped like:

```ts
type InventoryOverviewPoint = {
  label: string;
  actualSkuInventory: number;
  actualSales: number;
  predictedSales: number;
};
```

## Backend API Overview

The backend registers route blueprints in `api/function_app.py`.

Core documentation routes:

- `GET /api/openapi.json`
- `GET /api/docs`

Implemented feature areas:

- User
  - `POST /api/user/register`
- Purchase Requisition
  - `POST /api/pr/create`
- Agent / AI
  - `GET|POST /api/agent/test`
  - `GET|POST /api/agent/test-tools`
  - `POST /api/agent/mock/get-inventory`
  - `POST /api/agent/mock/create-pr`

## CI and Deployment

### Frontend Lint Workflow

`.github/workflows/lint.yml`

- runs on push
- installs frontend dependencies
- runs `npm run lint` in `frontend/`

### Azure Static Web Apps

`.github/workflows/azure-static-web-apps-purple-bay-035486b10.yml`

- deploys the frontend from `./frontend`
- includes `./api` as the API location
- expects static output from `./out`

### Azure Functions Deployment

`.github/workflows/main_cow-horse-procurement.yml`

- triggers on pushes to the `backend` branch
- installs backend dependencies with Python 3.12
- zips `api/` and deploys to Azure Functions

## Testing Status

No automated tests are configured in the current repository state.

What is available:

- frontend linting via `npm run lint`
- production export verification via `npm run build`

## Development Notes

- Frontend source is now TypeScript-based
- Tailwind content scanning is configured for `.js`, `.jsx`, `.ts`, and `.tsx`
- Frontend edits should be followed by `npm run lint`
- The backend uses Azure Table Storage and should return explicit HTTP status codes for failures

## Suggested Workflow

Frontend changes:

```bash
cd frontend
npm run lint
npm run build
```

Backend changes:

```bash
cd api
pip install -r requirements.txt
func start
```

If you are deploying to Azure, make sure the relevant GitHub secrets and Azure app settings are configured before pushing.

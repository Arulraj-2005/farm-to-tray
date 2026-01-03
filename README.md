# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0716c266-9381-499e-9ab7-26a74a05252a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0716c266-9381-499e-9ab7-26a74a05252a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0716c266-9381-499e-9ab7-26a74a05252a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Backend (Node + Express + Hyperledger Fabric)

This project now includes a basic backend scaffold designed to plug into Hyperledger Fabric. It exposes the endpoints used by the frontend and returns lat/lng coordinates for map visualization.

Endpoints:
- POST `/api/batch` — create a batch on-chain (farmer stage)
- POST `/api/batch/:id/update` — append status updates (distributor/retailer)
- GET `/trace/:id` — fetch batch with full history

Quick start:
```sh
# From project root
cd backend
cp .env.example .env
npm i
npm run dev
```

Environment variables (see `.env.example`):
- `PORT` — server port
- `USE_FILE_STORE` — if `true`, use local JSON file store (for demos)
- `FABRIC_ENABLED` — if `true`, use Hyperledger Fabric gateway
- `FABRIC_CONNECTION_PROFILE` — path to CCP JSON
- `FABRIC_MSP_ID`, `FABRIC_USER_ID`, `FABRIC_CHANNEL`, `FABRIC_CHAINCODE`

Data model notes:
- Locations should be sent and stored as `{ lat: number, lng: number }`.
- The API serializes to a simple string `"lat,lng"` when necessary for legacy consumers, but the canonical format is the object.

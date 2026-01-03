# AgriChain Backend

Node + Express backend with optional Hyperledger Fabric integration and a local JSON file store for demos.

## Features
- Endpoints used by the frontend
  - POST `/api/batch` — create batch (farmer)
  - POST `/api/batch/:id/update` — update batch (distributor/retailer)
  - GET `/trace/:id` — fetch batch and history
- Coordinates are stored as `{ lat, lng }` and returned to the frontend as `"lat,lng"` strings for compatibility.
- Toggle between Fabric and file store via env flags.

## Quick start
```sh
cd backend
npm i
npm run dev
```
Backend runs on `http://localhost:4000` by default.

## Environment variables
- `PORT=4000` — Port to run server
- `USE_FILE_STORE=true` — Use local JSON file storage for demo
- `FABRIC_ENABLED=false` — Enable Hyperledger Fabric gateway
- `FABRIC_CCP=./fabric/connection-org1.json` — Path to CCP JSON
- `FABRIC_WALLET=./fabric/wallet` — Filesystem wallet path
- `FABRIC_MSPID=Org1MSP` — MSP ID
- `FABRIC_IDENTITY=appUser` — Enrolled user ID
- `FABRIC_CHANNEL=mychannel` — Channel name
- `FABRIC_CHAINCODE=agrichain` — Chaincode name
- `FABRIC_DISCOVERY_AS_LOCALHOST=true` — Discovery option for local Docker

## Hyperledger Fabric (Detailed setup)
When `FABRIC_ENABLED=true`, the server will call:
- `CreateBatch(batchId, metadataJson)`
- `UpdateBatch(batchId, statusUpdateJson)`
- `ReadBatch(batchId)`

Adjust transaction names/args to match your chaincode.

### Setup steps
1) Start Fabric test network (example)
```sh
cd fabric-samples/test-network
./network.sh down
./network.sh up createChannel -c mychannel -ca
./network.sh deployCC -c mychannel -ccn agrichain -ccp ../chaincode/agrichain -ccl go
```

2) Provide connection profile and create wallet
- Copy Org1 connection profile to `backend/fabric/connection-org1.json`
- Ensure `backend/fabric/wallet` exists (empty initially)

3) Configure `.env` in `backend/` (example)
```
PORT=4000
USE_FILE_STORE=false
FABRIC_ENABLED=true
FABRIC_CCP=./fabric/connection-org1.json
FABRIC_WALLET=./fabric/wallet
FABRIC_MSPID=Org1MSP
FABRIC_IDENTITY=appUser
FABRIC_CHANNEL=mychannel
FABRIC_CHAINCODE=agrichain
FABRIC_DISCOVERY_AS_LOCALHOST=true
```

4) Enroll admin and appUser into wallet
```sh
npm run --workspace backend fabric:enroll
```

5) Run backend
```sh
npm run --workspace backend dev
```

6) Verify health
```sh
curl http://localhost:4000/health
```

## Data shape
```json
{
  "batchId": "BATCH-...",
  "metadata": {
    "name": "Farmer Name",
    "produce": "Tomatoes",
    "price": 12.5,
    "quantity": 100,
    "location": { "lat": 11.016844, "lng": 76.955832 },
    "harvestDate": "2025-01-01T00:00:00Z",
    "role": "farmer"
  },
  "currentOwner": "FarmerMSP",
  "status": "HARVESTED",
  "history": [
    {
      "action": "CREATE",
      "actor": "FarmerMSP",
      "location": { "lat": 11.016844, "lng": 76.955832 },
      "timestamp": "2025-01-01T00:00:00Z",
      "details": { ... }
    }
  ]
}
``` 
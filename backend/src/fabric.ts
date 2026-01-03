let Gateway: any, Wallets: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ Gateway, Wallets } = require('fabric-network'));
} catch {
  // Fabric not installed; keep stubs
}
import { readFileSync } from 'fs';
import path from 'path';

interface FabricConfig {
  enabled: boolean;
  ccpPath: string;
  walletPath: string;
  mspId: string;
  identity: string;
  channel: string;
  chaincode: string;
  asLocalhost: boolean;
}

export async function getFabricConfig(): Promise<FabricConfig> {
  return {
    enabled: process.env.FABRIC_ENABLED === 'true',
    ccpPath: process.env.FABRIC_CCP || './fabric/connection-org1.json',
    walletPath: process.env.FABRIC_WALLET || './fabric/wallet',
    mspId: process.env.FABRIC_MSPID || 'Org1MSP',
    identity: process.env.FABRIC_IDENTITY || 'appUser',
    channel: process.env.FABRIC_CHANNEL || 'mychannel',
    chaincode: process.env.FABRIC_CHAINCODE || 'agrichain',
    asLocalhost: (process.env.FABRIC_DISCOVERY_AS_LOCALHOST || 'true') === 'true',
  };
}

async function connect(): Promise<{ network: any; gateway: any; chaincode: string } | null> {
  const cfg = await getFabricConfig();
  if (!cfg.enabled || !Gateway || !Wallets) return null;

  const ccp = JSON.parse(readFileSync(path.resolve(cfg.ccpPath), 'utf-8'));
  const wallet = await Wallets.newFileSystemWallet(path.resolve(cfg.walletPath));

  const identity = await wallet.get(cfg.identity);
  if (!identity) {
    throw new Error(`Fabric identity "${cfg.identity}" not found in wallet at ${cfg.walletPath}. Run the enrollment script to populate it.`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp as any, {
    wallet,
    identity: cfg.identity,
    discovery: { enabled: true, asLocalhost: cfg.asLocalhost },
  } as any);

  const network = await gateway.getNetwork(cfg.channel);
  return { network, gateway, chaincode: cfg.chaincode };
}

export async function fabricSubmit(transactionName: string, ...args: string[]): Promise<any> {
  const conn = await connect();
  if (!conn) return { ok: false, message: 'FABRIC_DISABLED' };
  try {
    const contract = conn.network.getContract(conn.chaincode);
    const result = await contract.submitTransaction(transactionName, ...args);
    await conn.gateway.disconnect();
    try {
      return JSON.parse(result.toString() || '{}');
    } catch {
      return result?.toString();
    }
  } catch (err) {
    await conn.gateway.disconnect();
    throw err;
  }
}

export async function fabricEvaluate(transactionName: string, ...args: string[]): Promise<any> {
  const conn = await connect();
  if (!conn) return { ok: false, message: 'FABRIC_DISABLED' };
  try {
    const contract = conn.network.getContract(conn.chaincode);
    const result = await contract.evaluateTransaction(transactionName, ...args);
    await conn.gateway.disconnect();
    try {
      return JSON.parse(result.toString() || '{}');
    } catch {
      return result?.toString();
    }
  } catch (err) {
    await conn.gateway.disconnect();
    throw err;
  }
} 
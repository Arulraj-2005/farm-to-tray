/*
 Script to enroll Org1 admin and register/enroll appUser into a filesystem wallet.
 Usage (from backend dir):
   npx ts-node src/fabricEnroll.ts
 Requires env:
   FABRIC_CCP, FABRIC_WALLET, FABRIC_MSPID
*/
import fs from 'fs';
import path from 'path';
import { Wallets } from 'fabric-network';
import type { X509Identity } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
async function main() {

  const ccpPath = process.env.FABRIC_CCP || './fabric/connection-org1.json';
  const walletPath = process.env.FABRIC_WALLET || './fabric/wallet';
  const mspId = process.env.FABRIC_MSPID || 'Org1MSP';
  const userId = process.env.FABRIC_IDENTITY || 'appUser';

  const ccp = JSON.parse(fs.readFileSync(path.resolve(ccpPath), 'utf8'));
  const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]];
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

  const wallet = await Wallets.newFileSystemWallet(path.resolve(walletPath));

  // Enroll admin if missing
  const adminId = 'admin';
  let adminIdentity = (await wallet.get(adminId)) as X509Identity | undefined;
  if (!adminIdentity) {
    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    adminIdentity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId,
      type: 'X.509',
    } as X509Identity;
    await wallet.put(adminId, adminIdentity);
    // eslint-disable-next-line no-console
    console.log('Enrolled admin and imported to wallet');
  }

  // Register and enroll app user if missing
  const existing = (await wallet.get(userId)) as X509Identity | undefined;
  if (!existing) {
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminId);
    const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: userId, role: 'client' }, adminUser);
    const enrollment = await ca.enroll({ enrollmentID: userId, enrollmentSecret: secret });
    const userIdentity: X509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId,
      type: 'X.509',
    };
    await wallet.put(userId, userIdentity);
    // eslint-disable-next-line no-console
    console.log(`Registered and enrolled ${userId}, imported to wallet`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`${userId} already exists in wallet`);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});




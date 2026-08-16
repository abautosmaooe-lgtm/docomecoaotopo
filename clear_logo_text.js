import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore('ai-studio-325c702f-d4ae-4b6b-a2c7-5a0ce3d07c81');

async function run() {
  const docRef = db.collection('published_data').doc('site_config');
  const doc = await docRef.get();
  if (doc.exists) {
    const data = doc.data();
    if (data.logoConfig) {
      data.logoConfig.customText1 = '';
      data.logoConfig.customText2 = '';
      data.logoConfig.customSub = '';
      await docRef.set({ logoConfig: data.logoConfig }, { merge: true });
      console.log('Successfully cleared logo text in Firestore');
    }
  } else {
    console.log('Doc does not exist');
  }
}
run().catch(console.error);

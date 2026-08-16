import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));

const app = initializeApp({
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  measurementId: config.measurementId
});

const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const docSnap = await getDoc(doc(db, "portal", "config"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("FIRESTORE CONFIG DATA:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log("No document found in Firestore under portal/config");
    }
  } catch (e) {
    console.error("Error reading Firestore:", e);
  } finally {
    process.exit(0);
  }
}

run();

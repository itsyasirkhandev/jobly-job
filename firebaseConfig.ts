import { initializeApp, getApps } from "firebase/app";
import { clientConfig } from "./lib/services/Config";

const firebaseConfig = {
  apiKey: clientConfig.firebaseApiKey,
  authDomain: clientConfig.firebaseAuthDomain,
  projectId: clientConfig.firebaseProjectId,
  storageBucket: clientConfig.firebaseStorageBucket,
  messagingSenderId: clientConfig.firebaseMessagingSenderId,
  appId: clientConfig.firebaseAppId,
};

// Initialize Firebase only if there are no existing apps initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;

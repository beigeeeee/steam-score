import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    return initializeApp({ projectId: "demo-project" });
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      console.log("[Firebase Admin] Initializing with service account:", parsed.client_email);
      return initializeApp({
        credential: cert(parsed),
      });
    } catch (e) {
      console.error("[Firebase Admin] Failed to parse service account JSON:", e);
    }
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) {
    console.log("[Firebase Admin] Initializing with project ID only:", projectId);
    return initializeApp({ projectId });
  }

  return initializeApp();
}

const adminApp = getAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };

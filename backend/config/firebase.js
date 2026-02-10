const admin = require('firebase-admin');

let firebaseApp = null;

function initFirebase() {
  if (admin.apps.length) {
    return admin.apps[0];
  }

  // Use service account file if GOOGLE_APPLICATION_CREDENTIALS is set
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('[Firebase] Initializing with GOOGLE_APPLICATION_CREDENTIALS file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    console.log('[Firebase] Initializing with individual env vars');
    console.log('[Firebase]   Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('[Firebase]   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('[Firebase]   Private Key length:', privateKey.length);
    console.log('[Firebase]   Private Key starts with "-----BEGIN":', privateKey.startsWith('-----BEGIN'));
    console.log('[Firebase]   Private Key ends with "PRIVATE KEY-----":', privateKey.trimEnd().endsWith('PRIVATE KEY-----'));
    // Use individual env vars
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
  } else if (process.env.NODE_ENV === 'test') {
    // In test mode, initialize without credentials (tests will mock)
    firebaseApp = admin.initializeApp({ projectId: 'test-project' });
  } else {
    console.warn('[Firebase] No credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID.');
    firebaseApp = admin.initializeApp({ projectId: 'unconfigured' });
  }

  return firebaseApp;
}

function getAuth() {
  if (!admin.apps.length) {
    initFirebase();
  }
  return admin.auth();
}

function getApp() {
  if (!admin.apps.length) {
    initFirebase();
  }
  return admin.apps[0];
}

async function validateFirebaseCredentials() {
  try {
    const auth = getAuth();
    // listUsers with maxResults=1 is a lightweight call to verify credentials work
    await auth.listUsers(1);
    console.log('[Firebase] Credential validation PASSED - Firebase Admin SDK is working');
    return true;
  } catch (err) {
    console.error('[Firebase] Credential validation FAILED:', err.code, err.message);
    console.error('[Firebase] Full error:', err);
    return false;
  }
}

module.exports = { initFirebase, getAuth, getApp, validateFirebaseCredentials };

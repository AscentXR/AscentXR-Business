const admin = require('firebase-admin');

let firebaseApp = null;

function initFirebase() {
  if (admin.apps.length) {
    return admin.apps[0];
  }

  // Use service account file if GOOGLE_APPLICATION_CREDENTIALS is set
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Use individual env vars
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
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

module.exports = { initFirebase, getAuth, getApp };

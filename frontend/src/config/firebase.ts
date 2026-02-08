import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDSgGJd_xl5a9fYG5hdDituPWWboSDB_84',
  authDomain: 'ascentxr-business-production.up.railway.app',
  projectId: 'ascent-xr-business',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

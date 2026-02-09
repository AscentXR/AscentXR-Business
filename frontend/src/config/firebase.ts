import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBeLzpNkL5Tc6qsT-KzXkzo11mXzw8ftlI',
  authDomain: 'ascentxr-business.firebaseapp.com',
  projectId: 'ascentxr-business',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

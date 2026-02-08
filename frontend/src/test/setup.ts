import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

// Mock Firebase config globally to prevent FirebaseError: auth/invalid-api-key in tests
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: { getIdToken: vi.fn().mockResolvedValue('mock-firebase-token') },
    onAuthStateChanged: vi.fn(),
  },
  default: {},
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

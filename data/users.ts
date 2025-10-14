import { AuthUser } from '@/types/auth';

// Mock user database
// In production, this would be stored in a secure backend database
export const MOCK_USERS: AuthUser[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    role: 'user',
  },
];

// Helper functions
export function findUserByUsername(username: string): AuthUser | undefined {
  return MOCK_USERS.find((u) => u.username === username);
}

export function authenticateUser(username: string, password: string): AuthUser | null {
  const user = findUserByUsername(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export function getAllUsers(): AuthUser[] {
  return MOCK_USERS;
}

export function addUser(user: Omit<AuthUser, 'id'>): AuthUser {
  const newUser: AuthUser = {
    ...user,
    id: Date.now().toString(),
  };
  MOCK_USERS.push(newUser);
  return newUser;
}

export function deleteUser(userId: string): boolean {
  const index = MOCK_USERS.findIndex((u) => u.id === userId);
  if (index !== -1) {
    MOCK_USERS.splice(index, 1);
    return true;
  }
  return false;
}

export function updateUser(userId: string, updates: Partial<AuthUser>): AuthUser | null {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (user) {
    Object.assign(user, updates);
    return user;
  }
  return null;
}

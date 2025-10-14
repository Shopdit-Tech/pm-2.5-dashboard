export type UserRole = 'admin' | 'user';

export type User = {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
};

export type UserCredentials = {
  username: string;
  password: string;
};

export type AuthUser = User & {
  password: string;
};

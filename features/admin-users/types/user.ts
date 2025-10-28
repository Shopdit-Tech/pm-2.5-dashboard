export type UserRole = 'admin' | 'user';

/**
 * User data structure from API
 */
export type AdminUser = {
  id: string;
  email: string;
  app_metadata: {
    role: UserRole;
    provider: string;
    providers: string[];
  };
  user_metadata: {
    email_verified: boolean;
  };
  created_at: string;
  last_sign_in_at?: string;
};

/**
 * Request payload for creating new user
 */
export type CreateUserRequest = {
  email: string;
  password: string;
  role: UserRole;
};

/**
 * Response from create user API
 */
export type CreateUserResponse = {
  user_id: string;
};

/**
 * Response from delete user API
 */
export type DeleteUserResponse = {
  ok: boolean;
  deleted_user_id: string;
};

/**
 * Response from get users API
 */
export type GetUsersResponse = {
  users: AdminUser[];
};

export type AuthRole = 'user' | 'admin';

export type AuthClaims = {
  whmcsUserId: number;
  role: AuthRole;
};



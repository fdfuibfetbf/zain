import jwt from 'jsonwebtoken';

import type { AuthClaims } from './authTypes.js';

const ACCESS_TTL_SECONDS = 15 * 60;

export class JwtService {
  async signAccessToken(claims: AuthClaims, secret: string): Promise<string> {
    return jwt.sign(claims, secret, {
      algorithm: 'HS256',
      expiresIn: ACCESS_TTL_SECONDS,
    });
  }

  verifyAccessToken(token: string, secret: string): AuthClaims {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return decoded as AuthClaims;
  }
}



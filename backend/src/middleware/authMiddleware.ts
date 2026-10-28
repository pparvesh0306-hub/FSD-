import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';
import { getCache } from '../redis/redisClient';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_identity_governance_2026_x90';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  token?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted in Redis
    const isBlacklisted = await getCache(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Token has been invalidated (logged out).' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    req.token = token;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
  }
};

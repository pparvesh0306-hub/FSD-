import { Response, NextFunction } from 'express';
import { PrivilegedAccountService } from '../services/privilegedAccountService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class PrivilegedAccountController {
  static async getAllAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accounts = await PrivilegedAccountService.getAllAccounts();
      res.json({ success: true, data: accounts });
    } catch (err) {
      next(err);
    }
  }

  static async createAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { user_id, cloud_platform_id, account_name, account_type, access_level } = req.body;
      if (!cloud_platform_id || !account_name || !account_type || !access_level) {
        return res.status(400).json({ success: false, message: 'cloud_platform_id, account_name, account_type, and access_level are required.' });
      }

      const account = await PrivilegedAccountService.createAccount(
        { user_id, cloud_platform_id: Number(cloud_platform_id), account_name, account_type, access_level },
        req.user!.email,
        req.user!.userId
      );
      res.status(201).json({ success: true, message: 'Privileged account created successfully', data: account });
    } catch (err) {
      next(err);
    }
  }

  static async updateAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await PrivilegedAccountService.updateAccount(id, req.body, req.user!.email, req.user!.userId);
      res.json({ success: true, message: 'Privileged account updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await PrivilegedAccountService.deleteAccount(id, req.user!.email, req.user!.userId);
      res.json({ success: true, message: 'Privileged account deleted' });
    } catch (err) {
      next(err);
    }
  }
}

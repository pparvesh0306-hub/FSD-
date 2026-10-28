import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class UserController {
  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await UserService.getUserById(id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, full_name, role, department } = req.body;
      if (!email || !full_name) {
        return res.status(400).json({ success: false, message: 'Email and full_name are required.' });
      }

      const user = await UserService.createUser(
        { email, password, full_name, role, department },
        req.user!.email,
        req.user!.userId
      );
      res.status(201).json({ success: true, message: 'User created successfully', data: user });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await UserService.updateUser(id, req.body, req.user!.email, req.user!.userId);
      res.json({ success: true, message: 'User updated successfully', data: user });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await UserService.deleteUser(id, req.user!.email, req.user!.userId);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

import { Response, NextFunction } from 'express';
import { RoleService } from '../services/roleService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class RoleController {
  static async getAllRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const roles = await RoleService.getAllRoles();
      res.json({ success: true, data: roles });
    } catch (err) {
      next(err);
    }
  }

  static async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, permissionIds } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Role name is required.' });

      const role = await RoleService.createRole(
        { name, description: description || '', permissionIds },
        req.user!.email,
        req.user!.userId
      );
      res.status(201).json({ success: true, message: 'Role created successfully', data: role });
    } catch (err) {
      next(err);
    }
  }

  static async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const role = await RoleService.updateRole(id, req.body, req.user!.email, req.user!.userId);
      res.json({ success: true, message: 'Role updated successfully', data: role });
    } catch (err) {
      next(err);
    }
  }

  static async deleteRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await RoleService.deleteRole(id, req.user!.email, req.user!.userId);
      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getAllPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const perms = await RoleService.getAllPermissions();
      res.json({ success: true, data: perms });
    } catch (err) {
      next(err);
    }
  }
}

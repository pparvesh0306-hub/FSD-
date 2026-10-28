import { RoleModel, PermissionModel, RolePermissionModel, getNextSequenceValue } from '../models';
import { Role, Permission } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class RoleService {
  static async getAllRoles(): Promise<Role[]> {
    const cached = await getCache('roles:all');
    if (cached) return JSON.parse(cached);

    const roleDocs = await RoleModel.find().sort({ id: 1 }).lean();
    const roles: Role[] = [];

    for (const r of roleDocs) {
      const { _id, __v, ...roleObj } = r as any;
      const rpDocs = await RolePermissionModel.find({ role_id: roleObj.id }).lean();
      const pIds = rpDocs.map(rp => rp.permission_id);
      const permDocs = await PermissionModel.find({ id: { $in: pIds } }).lean();
      const permissions: Permission[] = permDocs.map(({ _id, __v, ...p }: any) => p as Permission);
      roles.push({ ...roleObj, permissions });
    }

    await setCache('roles:all', JSON.stringify(roles), 300);
    return roles;
  }

  static async getAllPermissions(): Promise<Permission[]> {
    const cached = await getCache('permissions:all');
    if (cached) return JSON.parse(cached);

    const permDocs = await PermissionModel.find().sort({ category: 1, name: 1 }).lean();
    const permissions: Permission[] = permDocs.map(({ _id, __v, ...p }: any) => p as Permission);

    await setCache('permissions:all', JSON.stringify(permissions), 600);
    return permissions;
  }

  static async createRole(
    data: { name: string; description: string; permissionIds?: number[] },
    adminEmail: string,
    adminId: number
  ): Promise<Role> {
    const newId = await getNextSequenceValue('roles');
    const createdRole = await RoleModel.create({
      id: newId,
      name: data.name,
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const { _id, __v, ...roleObj } = createdRole.toObject() as any;

    if (data.permissionIds && data.permissionIds.length > 0) {
      const mappings = data.permissionIds.map(pId => ({ role_id: newId, permission_id: pId }));
      await RolePermissionModel.insertMany(mappings);
    }

    await delCache('roles:all');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'ROLE_CREATED',
      resourceType: 'ROLE',
      resourceId: String(roleObj.id),
      description: `Created new role '${roleObj.name}' with ${data.permissionIds?.length || 0} permissions assigned`
    });

    return roleObj as Role;
  }

  static async updateRole(
    id: number,
    data: { name?: string; description?: string; permissionIds?: number[] },
    adminEmail: string,
    adminId: number
  ): Promise<Role> {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;

    const updated = await RoleModel.findOneAndUpdate(
      { id },
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updated) throw { status: 404, message: 'Role not found' };
    const { _id, __v, ...roleObj } = updated as any;

    if (data.permissionIds) {
      await RolePermissionModel.deleteMany({ role_id: id });
      if (data.permissionIds.length > 0) {
        const mappings = data.permissionIds.map(pId => ({ role_id: id, permission_id: pId }));
        await RolePermissionModel.insertMany(mappings);
      }
    }

    await delCache('roles:all');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'ROLE_UPDATED',
      resourceType: 'ROLE',
      resourceId: String(id),
      description: `Updated role permissions and details for role #${id}`
    });

    return roleObj as Role;
  }

  static async deleteRole(id: number, adminEmail: string, adminId: number): Promise<void> {
    const res = await RoleModel.deleteOne({ id });
    if (res.deletedCount === 0) throw { status: 404, message: 'Role not found' };

    await RolePermissionModel.deleteMany({ role_id: id });

    await delCache('roles:all');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'ROLE_DELETED',
      resourceType: 'ROLE',
      resourceId: String(id),
      description: `Deleted custom role #${id}`
    });
  }
}

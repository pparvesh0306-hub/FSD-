import {
  AccessReviewModel,
  UserModel,
  PrivilegedAccountModel,
  CloudPlatformModel,
  getNextSequenceValue
} from '../models';
import { AccessReview } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class AccessReviewService {
  static async getAllReviews(userId?: number, role?: string): Promise<AccessReview[]> {
    const isUserRole = role === 'User' && userId !== undefined;
    const cacheKey = isUserRole ? `access_reviews:user:${userId}` : 'access_reviews:all';
    const cached = await getCache(cacheKey);
    if (cached) return JSON.parse(cached);

    const query = isUserRole ? { user_id: userId } : {};
    const revDocs = await AccessReviewModel.find(query).sort({ created_at: -1 }).lean();
    const reviews: AccessReview[] = [];

    const userDocs = await UserModel.find().select('id full_name email').lean();
    const userMap = new Map(userDocs.map(u => [u.id, u]));

    const accountDocs = await PrivilegedAccountModel.find().select('id account_name').lean();
    const accountMap = new Map(accountDocs.map(a => [a.id, a]));

    const platformDocs = await CloudPlatformModel.find().select('id name').lean();
    const platformMap = new Map(platformDocs.map(p => [p.id, p]));

    for (const doc of revDocs) {
      const { _id, __v, ...rev } = doc as any;
      const user = userMap.get(rev.user_id);
      const acc = accountMap.get(rev.privileged_account_id);
      const cp = platformMap.get(rev.cloud_platform_id);
      const reviewer = rev.reviewer_id ? userMap.get(rev.reviewer_id) : null;

      reviews.push({
        ...rev,
        user_name: user?.full_name || 'User',
        user_email: user?.email || '',
        account_name: acc?.account_name || 'Account',
        platform_name: cp?.name || 'Cloud Platform',
        reviewer_name: reviewer?.full_name || 'Unassigned'
      });
    }

    await setCache(cacheKey, JSON.stringify(reviews), 60);
    return reviews;
  }

  static async createReview(
    data: {
      user_id: number;
      privileged_account_id: number;
      cloud_platform_id: number;
      access_level: string;
      comments?: string;
    },
    reviewerId: number,
    reviewerEmail: string
  ): Promise<AccessReview> {
    const newId = await getNextSequenceValue('access_reviews');
    const created = await AccessReviewModel.create({
      id: newId,
      user_id: data.user_id,
      privileged_account_id: data.privileged_account_id,
      cloud_platform_id: data.cloud_platform_id,
      access_level: data.access_level,
      reviewer_id: reviewerId,
      status: 'PENDING',
      comments: data.comments || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const { _id, __v, ...review } = created.toObject() as any;

    await delCache('access_reviews:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: reviewerId,
      userEmail: reviewerEmail,
      action: 'ACCESS_REVIEW_CREATED',
      resourceType: 'ACCESS_REVIEW',
      resourceId: String(review.id),
      description: `Scheduled new access review for user #${data.user_id}`
    });

    return review as AccessReview;
  }

  static async updateReviewStatus(
    id: number,
    status: 'APPROVED' | 'REVOKED',
    reviewerId: number,
    reviewerEmail: string,
    comments?: string
  ): Promise<AccessReview> {
    const updatePayload: any = {
      status,
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (comments !== undefined) updatePayload.comments = comments;

    const updatedDoc = await AccessReviewModel.findOneAndUpdate(
      { id },
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updatedDoc) throw { status: 404, message: 'Access review not found' };

    const { _id, __v, ...updated } = updatedDoc as any;

    if (status === 'REVOKED') {
      // If access revoked, set account status to INACTIVE
      await PrivilegedAccountModel.updateOne(
        { id: updated.privileged_account_id },
        { $set: { status: 'INACTIVE', updated_at: new Date().toISOString() } }
      );
    }

    await delCache('access_reviews:all');
    await delCache('privileged_accounts:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: reviewerId,
      userEmail: reviewerEmail,
      action: status === 'APPROVED' ? 'ACCESS_REVIEW_APPROVED' : 'ACCESS_REVIEW_REVOKED',
      resourceType: 'ACCESS_REVIEW',
      resourceId: String(id),
      description: `Access review #${id} completed with decision '${status}'. Comments: ${comments || 'None'}`
    });

    return updated as AccessReview;
  }
}

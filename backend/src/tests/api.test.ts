import { initDatabase } from '../database/db';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { AccessRequestService } from '../services/accessRequestService';
import { AccessReviewService } from '../services/accessReviewService';
import { AuditLogService } from '../services/auditLogService';

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  await initDatabase();
  let passed = 0;
  let failed = 0;

  // Test 1: Admin Login
  try {
    const loginResult = await AuthService.login('admin@example.com', 'Password123!');
    if (loginResult.token && loginResult.user.email === 'admin@example.com') {
      console.log('✅ Test 1 Passed: Admin Login');
      passed++;
    } else {
      throw new Error('Login returned unexpected payload');
    }
  } catch (err: any) {
    console.error('❌ Test 1 Failed:', err.message || err);
    failed++;
  }

  // Test 2: User Creation
  let newUserId = 0;
  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const user = await UserService.createUser(
      { email: testEmail, password: 'Password123!', full_name: 'Test Engineer', role: 'User', department: 'QA' },
      'admin@example.com',
      1
    );
    newUserId = user.id;
    if (user.email === testEmail && user.role === 'User') {
      console.log('✅ Test 2 Passed: User Creation');
      passed++;
    } else {
      throw new Error('User creation returned unexpected data');
    }
  } catch (err: any) {
    console.error('❌ Test 2 Failed:', err.message || err);
    failed++;
  }

  // Test 3: Access Request Creation
  let requestId = 0;
  try {
    const req = await AccessRequestService.createRequest(5, 'user@example.com', {
      privileged_account_id: 1,
      cloud_platform_id: 1,
      access_level: 'Security Admin',
      justification: 'Emergency vulnerability patch verification',
      duration_hours: 4
    });
    requestId = req.id;
    if (req.status === 'PENDING') {
      console.log('✅ Test 3 Passed: Access Request Creation');
      passed++;
    } else {
      throw new Error('Request status is not PENDING');
    }
  } catch (err: any) {
    console.error('❌ Test 3 Failed:', err.message || err);
    failed++;
  }

  // Test 4: Approval Workflow
  try {
    const updated = await AccessRequestService.processDecision(requestId, 'APPROVED', 3, 'approver@example.com', 'Approved after verification');
    if (updated.status === 'APPROVED') {
      console.log('✅ Test 4 Passed: Access Request Approval');
      passed++;
    } else {
      throw new Error('Status not updated to APPROVED');
    }
  } catch (err: any) {
    console.error('❌ Test 4 Failed:', err.message || err);
    failed++;
  }

  // Test 5: Rejection Workflow
  try {
    const req2 = await AccessRequestService.createRequest(5, 'user@example.com', {
      privileged_account_id: 2,
      cloud_platform_id: 2,
      access_level: 'Full Admin',
      justification: 'Testing rejection workflow',
      duration_hours: 2
    });
    const rejected = await AccessRequestService.processDecision(req2.id, 'REJECTED', 3, 'approver@example.com', 'Insufficient change reference');
    if (rejected.status === 'REJECTED') {
      console.log('✅ Test 5 Passed: Access Request Rejection');
      passed++;
    } else {
      throw new Error('Status not updated to REJECTED');
    }
  } catch (err: any) {
    console.error('❌ Test 5 Failed:', err.message || err);
    failed++;
  }

  // Test 6: Access Review
  try {
    const rev = await AccessReviewService.createReview({
      user_id: 5,
      privileged_account_id: 1,
      cloud_platform_id: 1,
      access_level: 'Full Admin',
      comments: 'Quarterly compliance audit'
    }, 2, 'security@example.com');

    const updatedRev = await AccessReviewService.updateReviewStatus(rev.id, 'APPROVED', 2, 'security@example.com', 'Review completed successfully');
    if (updatedRev.status === 'APPROVED') {
      console.log('✅ Test 6 Passed: Access Review Processing');
      passed++;
    } else {
      throw new Error('Review status not APPROVED');
    }
  } catch (err: any) {
    console.error('❌ Test 6 Failed:', err.message || err);
    failed++;
  }

  // Test 7: Audit Log Creation
  try {
    await AuditLogService.createLog({
      userId: 1,
      userEmail: 'admin@example.com',
      action: 'TEST_ACTION',
      resourceType: 'TEST',
      description: 'System sanity test log'
    });
    const logs = await AuditLogService.getLogs({ action: 'TEST_ACTION' });
    if (logs.length > 0) {
      console.log('✅ Test 7 Passed: Audit Log Verification');
      passed++;
    } else {
      throw new Error('Audit log record not found');
    }
  } catch (err: any) {
    console.error('❌ Test 7 Failed:', err.message || err);
    failed++;
  }

  console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

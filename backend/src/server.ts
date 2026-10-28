import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './database/db';
import { initRedis } from './redis/redisClient';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import permissionRoutes from './routes/permissionRoutes';
import privilegedAccountRoutes from './routes/privilegedAccountRoutes';
import accessRequestRoutes from './routes/accessRequestRoutes';
import approvalRoutes from './routes/approvalRoutes';
import accessReviewRoutes from './routes/accessReviewRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import complianceRoutes from './routes/complianceRoutes';
import cloudPlatformRoutes from './routes/cloudPlatformRoutes';
import settingsRoutes from './routes/settingsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Multi-Cloud Identity Governance Platform API is active.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/privileged-accounts', privilegedAccountRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/access-reviews', accessReviewRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/compliance-reports', complianceRoutes);
app.use('/api/cloud-platforms', cloudPlatformRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  console.log('[Bootstrap] Initializing database & cache connections...');
  
  // Await database connection and seeding before starting Express server
  await initDatabase();
  initRedis();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Multi-Cloud Identity Governance Server Running`);
    console.log(`🌐 Server Port: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
};

startServer();

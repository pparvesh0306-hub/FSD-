import path from 'path';
import dotenv from 'dotenv';
import dns from 'dns';

// Load .env from workspace root and local backend directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configure DNS fallback for SRV record resolution (prevents Windows querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err: any) {
  console.warn('[DNS Config] Could not override default DNS servers:', err.message);
}

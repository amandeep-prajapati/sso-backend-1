import type { Pool, PoolConnection } from 'mysql2/promise';
import {
  rupee112Pool,
  bhartaLoanPool,
  brightLoanPool,
  loan112Pool,
  rupeeOnTimePool,
  titanFincorpPool,
  kreditBuddhaPool,
  salary112Pool,
  masterPool,
  credMePool,
  salaryMantraPool
} from '../config/database';

export const executeQuery = async (query: string, tenantId?: number | string, params?: any[]): Promise<any> => {
  let selectedPool: Pool;
  let tenantName: string;
  const parsedTenantId = Number(tenantId);

  switch (parsedTenantId) {
    case 1:
      selectedPool = rupee112Pool;
      tenantName = 'Rupee112';
      break;
    case 2:
      selectedPool = bhartaLoanPool;
      tenantName = 'BhartaLoan';
      break;
    case 3:
      selectedPool = brightLoanPool;
      tenantName = 'BrightLoan';
      break;
    case 4:
      selectedPool = loan112Pool;
      tenantName = 'Loan112';
      break;
    case 5:
      selectedPool = rupeeOnTimePool;
      tenantName = 'RupeeOnTime';
      break;
    case 6:
      selectedPool = titanFincorpPool;
      tenantName = 'TitanFincorp';
      break;
    case 7:
      selectedPool = kreditBuddhaPool;
      tenantName = 'KreditBuddha';
      break;
    case 8:
      selectedPool = salary112Pool;
      tenantName = 'Salary112';
      break;
    case 9:
      selectedPool = credMePool;
      tenantName = 'CredMe';
      break;
    case 10:
      selectedPool = salaryMantraPool;
      tenantName = 'SalaryMantra';
      break;
    default:
      console.error(`Invalid or missing tenant ID: ${tenantId}`);
      throw new Error(`Invalid or missing tenant ID: ${tenantId}. Please provide a valid tenant ID (1-10 for tenants).`);
  }
  

  let connection: PoolConnection | undefined;
  try {
    connection = await selectedPool.getConnection();
    console.log(`\x1b[32m[${tenantName}] ✓ Connected\x1b[0m`);
    
    // Use execute for parameterized queries, query for plain SQL
    // console.log(query,'queryqueryqueryqueryqueryqueryqueryqueryqueryqueryqueryqueryqueryquery')
    const [result] = params ? await connection.execute(query, params) : await connection.query(query);
    
    connection.release();
    console.log(`\x1b[31m[${tenantName}] close Connection\x1b[0m`);
    return result;
  } catch (error: any) {
    if (connection) {
      connection.release();
      console.log(`\x1b[31m[${tenantName}] close when catch to Connection\x1b[0m`);
    }
    throw error;
  }
};

export const executeMasterQuery = async (query: string, params?: any[]): Promise<any> => {
  let connection: PoolConnection | undefined;
  try {
    console.log(query,'queryqueryqueryqueryquery')
    connection = await masterPool.getConnection();
    console.log(`\x1b[32m[Master] ✓ Connected\x1b[0m`);
    
    // Use execute for parameterized queries, query for plain SQL
    const [result] = params ? await connection.execute(query, params) : await connection.query(query);
    
    connection.release();
    console.log(`\x1b[31m[Master] close Connection\x1b[0m`);
    return result;
  } catch (error: any) {
    if (connection) {
      connection.release();
      console.log(`\x1b[31m[Master] close when catch to Connection\x1b[0m`);
    }
    throw error;
  }
};


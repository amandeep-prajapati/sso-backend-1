import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tenant-specific database pools
export const rupee112Pool = mysql.createPool({
  host: process.env.RUPEE112_DB_HOST || process.env.RUPEEMITR_DB_HOST,
  user: process.env.RUPEE112_DB_USER || process.env.RUPEEMITR_DB_USER,
  password: process.env.RUPEE112_DB_PASSWORD || process.env.RUPEEMITR_DB_PASSWORD,
  database: process.env.RUPEE112_DB_NAME || process.env.RUPEEMITR_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const bhartaLoanPool = mysql.createPool({
  host: process.env.BHARTALOAN_DB_HOST,
  user: process.env.BHARTALOAN_DB_USER,
  password: process.env.BHARTALOAN_DB_PASSWORD,
  database: process.env.BHARTALOAN_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const brightLoanPool = mysql.createPool({
  host: process.env.BRIGHTLOAN_DB_HOST,
  user: process.env.BRIGHTLOAN_DB_USER,
  password: process.env.BRIGHTLOAN_DB_PASSWORD,
  database: process.env.BRIGHTLOAN_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const loan112Pool = mysql.createPool({
  host: process.env.LOAN112_DB_HOST,
  user: process.env.LOAN112_DB_USER,
  password: process.env.LOAN112_DB_PASSWORD,
  database: process.env.LOAN112_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const rupeeOnTimePool = mysql.createPool({
  host: process.env.RUPEEONTIME_DB_HOST,
  user: process.env.RUPEEONTIME_DB_USER,
  password: process.env.RUPEEONTIME_DB_PASSWORD,
  database: process.env.RUPEEONTIME_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const titanFincorpPool = mysql.createPool({
  host: process.env.TITANFINCORP_DB_HOST,
  user: process.env.TITANFINCORP_DB_USER,
  password: process.env.TITANFINCORP_DB_PASSWORD,
  database: process.env.TITANFINCORP_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const kreditBuddhaPool = mysql.createPool({
  host: process.env.KREDITBUDDHA_DB_HOST,
  user: process.env.KREDITBUDDHA_DB_USER,
  password: process.env.KREDITBUDDHA_DB_PASSWORD,
  database: process.env.KREDITBUDDHA_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const credMePool = mysql.createPool({
  host: process.env.CREDME_DB_HOST,
  user: process.env.CREDME_DB_USER,
  password: process.env.CREDME_DB_PASSWORD,
  database: process.env.CREDME_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const salaryMantraPool = mysql.createPool({
  host: process.env.SALARYMANTRA_DB_HOST,
  user: process.env.SALARYMANTRA_DB_USER,
  password: process.env.SALARYMANTRA_DB_PASSWORD,
  database: process.env.SALARYMANTRA_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const salary112Pool = mysql.createPool({
  host: process.env.SALARY112_DB_HOST,
  user: process.env.SALARY112_DB_USER,
  password: process.env.SALARY112_DB_PASSWORD,
  database: process.env.SALARY112_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Master database pool (for baseline and admin tables - vimanotech_baseline_uat)
export const masterPool = mysql.createPool({
  host: process.env.DB_MASTER_HOST,
  user: process.env.DB_MASTER_USER,
  password: process.env.DB_MASTER_PASSWORD,
  database: process.env.DB_MASTER_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Test database connections at startup
rupee112Pool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.RUPEE112_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to Rupee112 DB:`, error.message || error);
});

bhartaLoanPool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.BHARTALOAN_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to BhartaLoan DB:`, error.message || error);
});

brightLoanPool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.BRIGHTLOAN_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to BrightLoan DB:`, error.message || error);
});

loan112Pool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.LOAN112_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to Loan112 DB:`, error.message || error);
});

rupeeOnTimePool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.RUPEEONTIME_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to RupeeOnTime DB:`, error.message || error);
});

titanFincorpPool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.TITANFINCORP_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to TitanFincorp DB:`, error.message || error);
});

kreditBuddhaPool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.KREDITBUDDHA_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to KreditBuddha DB:`, error.message || error);
});

salary112Pool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.SALARY112_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to Salary112 DB:`, error.message || error);
});

credMePool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.CREDME_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to BrightLoan DB:`, error.message || error);
});

salaryMantraPool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.SALARYMANTRA_DB_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to SalaryMantra DB:`, error.message || error);
});

masterPool.getConnection().then((connection) => {
  console.log(`✓ ${process.env.DB_MASTER_NAME} DB connected successfully`);
  connection.release();
}).catch((error) => {
  console.error(`✗ Error connecting to Master DB:`, error.message || error);
});

// Legacy DatabaseConnection class for backward compatibility
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: any;

  private constructor() {
    this.pool = masterPool;
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPool(): any {
    return this.pool;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      connection.release();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export default DatabaseConnection;
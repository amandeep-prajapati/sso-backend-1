import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoDBConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionString: string;
  private dbName: string;

  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'error';
    this.dbName = 'vimano_logs';
  }

  async connect(): Promise<Db> {
    try {
      if (this.db) {
        return this.db;
      }

      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      
      console.log('Connected to MongoDB for logging');
      return this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
    }
  }

  getDb(): Db | null {
    return this.db;
  }
}

export const mongoConnection = new MongoDBConnection();
export default mongoConnection;
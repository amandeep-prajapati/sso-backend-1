import { AuthModel } from '../model/AuthModel';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../interfaces/Auth';

export class AuthService {
  private authModel = new AuthModel();

  async authenticateUser(email: string, password: string, source: number) {
    return await this.authModel.authenticateUser(email, password, source);
  }

  async validateDashboardAccess(roleName: string, dashboardType?: string) {
    return await this.authModel.validateDashboardAccess(roleName, dashboardType);
  }

  async getUserById(userId: number) {
    return await this.authModel.getUserById(userId);
  }

  async getUserAccessibleTenants(userId: number) {
    return await this.authModel.getUserAccessibleTenants(userId);
  }

  async verifyUserTenantAccess(userId: number, tenantId: number) {
    return await this.authModel.verifyUserTenantAccess(userId, tenantId);
  }

  async getTenantById(tenantId: number) {
    return await this.authModel.getTenantById(tenantId);
  }

  generateToken(payload: TokenPayload): string {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  }

  verifyToken(token: string): TokenPayload {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.verify(token, jwtSecret) as TokenPayload;
  }
}

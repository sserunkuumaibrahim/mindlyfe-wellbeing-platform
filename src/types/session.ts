
export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  expiresAt: Date;
}

export interface JwtPayload {
  email: string;
  sub: string;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  refreshToken: string;
}

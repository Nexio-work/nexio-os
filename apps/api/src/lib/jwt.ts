import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TTL = 15 * 60;   // 15 minutes in seconds
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days

export interface JwtPayload {
  sub: string;
  tenant_id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function createAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: Uint8Array
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(secret);
}

export async function createRefreshToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: Uint8Array
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL}s`)
    .sign(secret);
}

export async function verifyToken(
  token: string,
  secret: Uint8Array
): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JwtPayload;
}

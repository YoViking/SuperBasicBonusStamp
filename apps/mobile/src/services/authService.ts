import * as jose from 'jose';

const SECRET = new TextEncoder().encode('min_hemliga_nyckel_123456789');

export const generateStatusLink = async (phoneNumber: string, storeId?: string) => {
  const jwt = await new jose.SignJWT({ phone: phoneNumber, storeId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);

  const baseUrl = process.env.EXPO_PUBLIC_STATUS_WEB_URL || 'https://bonusstamp.vercel.app/status';
  return `${baseUrl}?token=${jwt}`;
};

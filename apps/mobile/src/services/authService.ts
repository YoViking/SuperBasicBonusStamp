import * as jose from 'jose';

const SECRET = new TextEncoder().encode('min_hemliga_nyckel_123456789');

export const generateStatusLink = async (phoneNumber: string) => {

    const jwt = await new jose.SignJWT({ phone: phoneNumber})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);

    // Länken till min framtida webbsida
    const baseUrl = "https://kamerastockholm.vercel.app/status";
    return `${baseUrl}?token=${jwt}`;
}
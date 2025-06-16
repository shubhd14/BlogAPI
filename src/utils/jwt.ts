import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_fallback";

// Function to generate both access and refresh tokens
export const generateTokens = (userId: string, role: string) => {
  const payload = { userId, role };

  //  Generate Access Token
  const accessToken = jwt.sign(
    payload,
    ACCESS_SECRET, // secret key
    { expiresIn: '15m' } // options object
  );

  //  Generate Refresh Token
  const refreshToken = jwt.sign(
    payload,
    REFRESH_SECRET, // secret key
    { expiresIn: '7d' } // options object
  );

  return { accessToken, refreshToken };
};

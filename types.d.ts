// types.d.ts 파일에 추가
import { Session as NextAuthSession } from "next-auth";

export interface CustomSession extends NextAuthSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  provider: string | null;
  snsProfile: object | null;
  expires: string; // ISODateString 대신 string으로 변경
  providerAccountId: string;
  accessToken: string;
  accessTokenExpires: string;
  refreshToken: string;
}

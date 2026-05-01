import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string;
      role: 'admin' | 'guest';
      mobileNumber: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    mobileNumber: string;
    role: 'admin' | 'guest';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId: string;
    role: 'admin' | 'guest';
    mobileNumber: string;
  }
}

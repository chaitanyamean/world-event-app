import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

async function seedAdminIfAbsent(): Promise<void> {
  const adminMobile = process.env.ADMIN_MOBILE;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminMobile || !adminPassword) return;

  const existing = await User.findOne({ mobileNumber: adminMobile });
  if (existing) return;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({ name: 'Admin', mobileNumber: adminMobile, passwordHash, role: 'admin' });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        mobileNumber: { label: 'Mobile Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.mobileNumber || !credentials?.password) return null;

        await connectDB();
        await seedAdminIfAbsent();

        const user = await User.findOne({ mobileNumber: credentials.mobileNumber });
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          mobileNumber: user.mobileNumber,
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role: 'admin' | 'guest' }).role;
        token.mobileNumber = (user as { mobileNumber: string }).mobileNumber;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userId = token.userId;
      session.user.role = token.role;
      session.user.mobileNumber = token.mobileNumber;
      return session;
    },
  },

  pages: { signIn: '/login' },
};

// app/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import User from "../models/Users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) throw new Error("Missing credentials");
        await connectToDatabase();
        const user = await User.findOne({ username: credentials.username });
        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user._id.toString(), name: user.name || user.username, email: user.email, role: user.role };
      }
    })
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // 24h JWT validity; cookie has no Max-Age (session cookie) by default
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;   // persist display name in JWT
        token.role = (user as any).role;  // persist role in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;  // expose to client
        session.user.name = token.name as string; // surface to client
      }
      return session;
    },
  },
};
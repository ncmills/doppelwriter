import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = sql();
        const rows = await db`
          SELECT id, email, name, password_hash, plan
          FROM users WHERE email = ${credentials.email as string}
        `;

        if (rows.length === 0) return null;

        const user = rows[0];
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth — create or link user, store tokens
      if (account?.provider === "google" && user.email) {
        const db = sql();
        const existing = await db`SELECT id FROM users WHERE email = ${user.email}`;

        if (existing.length === 0) {
          // Create new user from Google
          const bcryptLib = await import("bcryptjs");
          const randomPass = await bcryptLib.hash(crypto.randomUUID(), 10);
          await db`
            INSERT INTO users (email, name, password_hash, google_access_token, google_refresh_token, google_token_expiry)
            VALUES (${user.email}, ${user.name || null}, ${randomPass}, ${account.access_token || null}, ${account.refresh_token || null}, ${account.expires_at ? String(account.expires_at * 1000) : null})
          `;
        } else {
          // Update tokens for existing user
          await db`
            UPDATE users SET
              google_access_token = ${account.access_token || null},
              google_refresh_token = COALESCE(${account.refresh_token || null}, google_refresh_token),
              google_token_expiry = ${account.expires_at ? String(account.expires_at * 1000) : null}
            WHERE email = ${user.email}
          `;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Get the DB user id
        const db = sql();
        const [dbUser] = await db`SELECT id, plan FROM users WHERE email = ${token.email}`;
        if (dbUser) {
          token.id = dbUser.id;
          token.plan = dbUser.plan;
        }
      }
      if (account?.provider === "google") {
        token.hasGmail = true;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).plan = token.plan;
        (session.user as unknown as Record<string, unknown>).hasGmail = token.hasGmail || false;
      }
      return session;
    },
  },
});

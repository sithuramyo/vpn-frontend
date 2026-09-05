import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

import type { Admin, AdminRole } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    role?: AdminRole;
    adminId?: string;
    error?: "NotAuthorized" | "BackendUnavailable";
  }
}

// next-auth/jwt re-exports its JWT type from @auth/core/jwt in a way
// TypeScript's `declare module` augmentation can't reliably target across
// versions, so the extra fields are carried via this local intersection
// type and a cast at the one place they're written instead.
type AppToken = JWT & {
  backendToken?: string;
  role?: AdminRole;
  adminId?: string;
  error?: "NotAuthorized" | "BackendUnavailable";
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account }) {
      const appToken = token as AppToken;

      // account is only present on the initial sign-in, when we have the
      // raw Google id_token to exchange with the backend. On subsequent
      // requests we keep whatever the backend already told us.
      if (account?.id_token) {
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });

          if (res.status === 403) {
            appToken.error = "NotAuthorized";
            delete appToken.backendToken;
            return appToken;
          }
          if (!res.ok) {
            appToken.error = "BackendUnavailable";
            delete appToken.backendToken;
            return appToken;
          }

          const body = (await res.json()) as { data: { token: string; admin: Admin } };
          appToken.backendToken = body.data.token;
          appToken.role = body.data.admin.role;
          appToken.adminId = body.data.admin.id;
          delete appToken.error;
        } catch {
          appToken.error = "BackendUnavailable";
          delete appToken.backendToken;
        }
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as AppToken;
      session.backendToken = appToken.backendToken;
      session.role = appToken.role;
      session.adminId = appToken.adminId;
      session.error = appToken.error;
      return session;
    },
  },
});

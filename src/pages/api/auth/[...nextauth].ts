import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

interface Token extends JWT {
  accessToken?: string;
  refreshToken?: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/calendar",
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/cloud-identity.groups.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }): Promise<Token> {
      if (account) {
        const newToken = {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        };
        return newToken;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: (token as Token).accessToken,
        refreshToken: (token as Token).refreshToken,
      };
    },
  },
};

export default NextAuth(authOptions);

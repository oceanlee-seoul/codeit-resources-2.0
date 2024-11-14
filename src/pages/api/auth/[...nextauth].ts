/* eslint-disable no-param-reassign */
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

/** --- 토큰 갱신 로직 --- */
async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Math.floor(
        Date.now() / 1000 + refreshedTokens.expires_in,
      ),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
/** -------------------- */

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
    async signIn({ user, account }) {
      try {
        if (account?.access_token) {
          const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: "application/json",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data.photos && data.photos[0]?.url) {
              user.image = data.photos[0].url;
            }
          }
        }
        return true;
      } catch {
        return true;
      }
    },
    async jwt({ token, account }): Promise<Token> {
      if (account) {
        const newToken = {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at || 0) * 1000,
          refreshToken: account.refresh_token,
        };
        return newToken;
      }

      if (process.env.NODE_ENV === "development" && !token.refreshToken) {
        console.log("Skipping refresh in development mode on initial call");
        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      if (!token.refreshToken) throw new TypeError("Missing refresh_token");

      return refreshAccessToken(token);
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

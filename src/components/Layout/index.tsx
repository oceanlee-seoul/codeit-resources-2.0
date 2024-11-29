import colors from "@/constants/colors";
import useToast from "@/hooks/useToast";
import { adminAtom, userAtom } from "@/store/authUserAtom";
import { useAtom, useSetAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import React, { useEffect, useRef } from "react";

import NavigationBar from "./NavigationBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useAtom(userAtom);
  const setIsAdmin = useSetAtom(adminAtom);
  const router = useRouter();

  const { error } = useToast();
  const { data: session } = useSession();
  const syncInProgress = useRef(false);

  useEffect(() => {
    const getGoogleUser = async () => {
      if (syncInProgress.current) {
        return;
      }

      try {
        syncInProgress.current = true;

        if (session?.user) {
          const response = await fetch("/api/auth/syncUserInfo", {
            method: "POST",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
          }

          const result = await response.json();

          if (result.data) {
            setUser(result.data);
            setIsAdmin(result.data.role === "ADMIN");
          } else {
            router.push("/on-boarding");
          }
        }
      } catch (err) {
        setUser(null);
        setIsAdmin(false);

        if (err instanceof Error) {
          error(err.message || "인증에 실패했습니다. 다시 로그인해 주세요.");
        } else {
          error("인증에 실패했습니다. 다시 로그인해 주세요.");
        }

        await signOut({ redirect: false });
        router.push("/sign-in");
      } finally {
        syncInProgress.current = false;
      }
    };
    getGoogleUser();
  }, [session]);

  if (!user) {
    return null;
  }

  return (
    <div>
      {" "}
      <NextNProgress
        color={colors.purple[70]}
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow
        options={{
          easing: "ease",
          speed: 500,
          showSpinner: false,
          trickleSpeed: 900,
        }}
      />
      <NavigationBar />
      <main className="min-h-screen md:ml-200">{children}</main>
    </div>
  );
}

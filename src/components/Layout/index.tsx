import useToast from "@/hooks/useToast";
import { adminAtom, userAtom } from "@/store/authUserAtom";
import { useSetAtom } from "jotai";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";

import NavigationBar from "./NavigationBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom);
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

          const { data: userData } = await response.json();

          if (userData) {
            setUser(userData);
            setIsAdmin(userData?.role === "ADMIN");
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

  return (
    <div>
      <NavigationBar />
      <main className="min-h-screen md:ml-200">{children}</main>
    </div>
  );
}

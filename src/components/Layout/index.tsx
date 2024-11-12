import useToast from "@/hooks/useToast";
import { adminAtom, userAtom } from "@/store/authUserAtom";
import { useSetAtom } from "jotai";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

import NavigationBar from "./NavigationBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom);
  const setIsAdmin = useSetAtom(adminAtom);

  const { error } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    const getGoogleUser = async () => {
      try {
        if (session?.user) {
          const response = await fetch("/api/auth/syncUserInfo", {
            method: "POST",
          });
          if (!response.ok) {
            throw new Error();
          }
          const userData = await response.json();
          if (userData) {
            setUser(userData);
            setIsAdmin(userData?.role === "ADMIN");
          } else {
            throw new Error();
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        error("유저 인증 문제가 생겼습니다.");
        setUser(null);
        setIsAdmin(false);
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

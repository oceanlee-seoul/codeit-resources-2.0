import Button from "@/components/commons/Button";
import useToast from "@/hooks/useToast";
import { clearAllCookies } from "@/lib/utils/cookieUtils";
import LoadingSpinner from "@public/gifs/loading-spinner.svg";
import { signOut as signOutGoogle } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

function LogOutButton() {
  const { success, error } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await signOutGoogle({ redirect: false, callbackUrl: "/sign-in" });
      localStorage.clear();
      clearAllCookies();
      success("성공적으로 로그아웃되었습니다.");
      router.push("/sign-in");
    } catch (logoutError) {
      error(
        `로그아웃 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.: ${logoutError}`,
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mb-20 mt-50 flex items-center justify-center px-20">
      <Button variant="danger" disabled={isPending} onClick={handleLogout}>
        {isPending ? (
          <LoadingSpinner height={27} width="100%" />
        ) : (
          <div className="flex items-center justify-center gap-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>로그아웃</span>
          </div>
        )}
      </Button>
    </div>
  );
}

export default LogOutButton;

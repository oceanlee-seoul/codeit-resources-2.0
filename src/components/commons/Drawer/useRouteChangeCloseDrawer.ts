import { useRouter } from "next/router";
import { useEffect } from "react";

// 다른 페이지로 이동시 드로워 닫기
const useRouteChangeCloseDrawer = (handler: () => void) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", handler);
    return () => {
      router.events.off("routeChangeStart", handler);
    };
  }, [router, handler]);
};

export default useRouteChangeCloseDrawer;

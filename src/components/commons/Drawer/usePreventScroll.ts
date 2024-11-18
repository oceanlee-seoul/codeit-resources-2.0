import { useEffect } from "react";

// 모바일 사이즈에서 드로워 열렸을때 스크롤 방지
const usePreventScroll = (shouldPrevent: boolean) => {
  useEffect(() => {
    if (shouldPrevent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [shouldPrevent]);
};

export default usePreventScroll;

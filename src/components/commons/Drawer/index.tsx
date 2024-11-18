import Arrow from "@/../public/icons/icon-double-right-arrow.svg";
import useIsMobile from "@/hooks/useIsMobile";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { ReactNode } from "react";

import usePreventScroll from "./usePreventScroll";
import useRouteChangeCloseDrawer from "./useRouteChangeCloseDrawer";

interface DrawerProps {
  onClose: () => void;
  children: ReactNode; // 드로워 안에 내용들 children으로 채워주기
}

function Drawer({ onClose, children }: DrawerProps) {
  const [isOpenDrawer, setIsOpenDrawer] = useAtom(isOpenDrawerAtom);
  const isMobile = useIsMobile();

  usePreventScroll(isMobile && isOpenDrawer);
  useRouteChangeCloseDrawer(() => setIsOpenDrawer(false));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{
          x: isOpenDrawer ? 0 : "100%",
        }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 240, damping: 30 }}
        className="fixed right-0 top-0 z-30 flex h-full w-full flex-col border border-l-gray-40 bg-white p-32 shadow-lg md:w-1/2 lg:w-1/3"
      >
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="absolute left-16 top-16"
            onClick={onClose}
          >
            <Arrow />
          </button>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Drawer;

import { updateToastAtom } from "@/store/toastAtom";
import { useSetAtom } from "jotai";
import Image from "next/image";

const useToast = () => {
  const submitToast = useSetAtom(updateToastAtom);

  return {
    success: (message?: string) =>
      submitToast({
        type: "success",
        message,
        icon: (
          <Image
            width={20}
            height={20}
            alt="성공 아이콘"
            src="/icons/icon-check-bold.svg"
          />
        ),
      }),
    error: (message?: string) =>
      submitToast({
        type: "error",
        message,
        icon: <span className="pr-4 text-17-700 text-white">!</span>,
      }),
  };
};

export default useToast;

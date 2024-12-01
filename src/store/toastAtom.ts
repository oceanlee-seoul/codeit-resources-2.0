import { atom } from "jotai";

type ToastType = "success" | "error";

export type ToastProps = {
  id?: string;
  type: ToastType;
  icon: JSX.Element;
  message: string;
};

export const defaultMessage = {
  success: "요청이 성공했습니다",
  error: "요청이 실패했습니다",
};

export const backgroundColor = {
  success: "bg-green-80",
  error: "bg-red-500",
};

export const toastAtom = atom<ToastProps | null>(null);

export const updateToastAtom = atom(null, (_, set, { type, icon, message }) => {
  const newToast = {
    id: Date.now().toString(),
    type,
    icon,
    message,
  };

  set(toastAtom, newToast);
});

export const deleteToastAtom = atom(null, (_, set) => {
  set(toastAtom, null);
});

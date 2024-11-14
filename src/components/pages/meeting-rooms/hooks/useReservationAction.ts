import QUERY_KEY from "@/constants/queryKey";
import useModal from "@/hooks/useModal";
import useToast from "@/hooks/useToast";
import { RoomReservation, User } from "@/lib/api/amplify/helper";
import {
  cancelReservation,
  createReservation,
  updateReservation,
} from "@/lib/api/reservation";
import { userAtom } from "@/store/authUserAtom";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";

import { pickedReservationAtom } from "../context";
import pickedDateAtom from "../context/pickedDate";

const useReservationAction = (reservation?: RoomReservation) => {
  const user = useAtomValue(userAtom);
  const pickedDate = useAtomValue(pickedDateAtom);
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { openModal, closeModal } = useModal();
  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);
  const setPickedReservation = useSetAtom(pickedReservationAtom);

  const deleteRoomMutation = useMutation({
    mutationFn: async () => {
      if (reservation?.id) return cancelReservation(reservation, user as User);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });
      success("회의실 예약이 취소되었습니다");
    },
    onError: () => {
      error("회의실 예약 취소에 실패했습니다");
    },
  });

  // 회의실 예약 생성
  const createRoomMutation = useMutation({
    mutationFn: (re: RoomReservation) => createReservation(re),
    onSuccess: () => {
      setPickedReservation(null);
      success("회의실 예약이 생성되었습니다.");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });
    },
    onError: () => {
      error("회의실 예약 생성에 실패했습니다.");
    },
  });

  // 회의실 예약 업데이트
  const updateRoomMutation = useMutation({
    mutationFn: async (re: RoomReservation) => {
      if (re.id) {
        return updateReservation(re, user as User);
      }
      return null;
    },
    onSuccess: () => {
      success("회의실 예약이 업데이트되었습니다.");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });
    },
    onError: () => {
      error("회의실 예약 업데이트에 실패했습니다.");
    },
  });

  return {
    deleteRoomMutation: () => {
      openModal("deleteRoomReservationModal", {
        onConfirm: () => {
          deleteRoomMutation.mutate();
          closeModal();
        },
      });
    },
    createRoomMutation: (re: RoomReservation) => {
      openModal("createRoomReservationModal", {
        onConfirm: () => {
          createRoomMutation.mutate(re);
          closeModal();
          setIsOpenDrawer(false);
        },
      });
    },
    updateRoomMutation: (re: RoomReservation) => {
      openModal("updateRoomReservationModal", {
        onConfirm: () => {
          updateRoomMutation.mutate(re);
          closeModal();
          setIsOpenDrawer(false);
        },
      });
    },
  };
};

export default useReservationAction;

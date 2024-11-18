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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { pickedDateAtom, pickedReservationAtom } from "../context";
import { useGetReservations } from "./useGetReservations";

type ReservationListQueryReturnType = {
  data: RoomReservation[];
};

const useReservationAction = (reservation?: RoomReservation) => {
  const user = useAtomValue(userAtom);
  const pickedDate = useAtomValue(pickedDateAtom);
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { openModal, closeModal } = useModal();
  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);

  const [pickedReservation, setPickedReservation] = useAtom(
    pickedReservationAtom,
  );

  const { rooms } = useGetReservations();

  const getPrevReservationList =
    async (): Promise<ReservationListQueryReturnType> => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });

      const prevReservationList = queryClient.getQueryData([
        QUERY_KEY.ROOM_RESERVATION_LIST,
        pickedDate,
      ]);

      return prevReservationList as ReservationListQueryReturnType;
    };

  const deleteRoomMutation = useMutation({
    mutationFn: async () => {
      if (reservation?.id) return cancelReservation(reservation, user as User);
      return null;
    },
    onMutate: async () => {
      const prevReservationList = await getPrevReservationList();

      queryClient.setQueryData(
        [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
        (prev: ReservationListQueryReturnType) => ({
          ...prev,
          data: prev.data.filter((item) => item.id !== reservation?.id),
        }),
      );

      return { prevReservationList };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });
      success("회의실 예약이 취소되었습니다");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
        context?.prevReservationList,
      );
      error("회의실 예약 취소에 실패했습니다");
    },
  });

  // 회의실 예약 생성
  const createRoomMutation = useMutation({
    mutationFn: (re: RoomReservation) => createReservation(re),
    onMutate: async (re) => {
      const prevReservationList = await getPrevReservationList();

      const resource = rooms?.data.find((room) => room.id === re.resourceId);
      const reservationToAdd = {
        ...re,
        id: `temp_${uuidv4()}`,
        resourceType: "ROOM",
        status: "CONFIRMED",
        resourceSubtype: resource?.resourceSubtype,
        resourceName: resource?.name,
      };

      queryClient.setQueryData(
        [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
        (prev: ReservationListQueryReturnType) => ({
          ...prev,
          data: [...prev.data, reservationToAdd],
        }),
      );

      return { prevReservationList };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
        context?.prevReservationList,
      );
      error("회의실 예약 생성에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });
      success("회의실 예약이 생성되었습니다.");
    },
  });

  const clearStatus = useCallback(() => {
    closeModal();
    setIsOpenDrawer(false);
    setPickedReservation(null);
  }, [setIsOpenDrawer, setPickedReservation]);

  // 회의실 예약 업데이트
  const updateRoomMutation = useMutation({
    mutationFn: async (re: RoomReservation) => {
      if (re.id) {
        return updateReservation(re, user as User);
      }
      return null;
    },
    onMutate: async (re) => {
      const prevReservationList = await getPrevReservationList();

      const resource = rooms?.data.find((room) => room.id === re.resourceId);
      const reservationToUpdate = {
        ...re,
        id: pickedReservation?.id,
        resourceType: "ROOM",
        status: "CONFIRMED",
        resourceSubtype: resource?.resourceSubtype,
        resourceName: resource?.name,
      };
      const reservationListWithoutUpdatedOne = prevReservationList.data.filter(
        (item) => item.id !== re.id,
      );

      queryClient.setQueryData(
        [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
        (prev: ReservationListQueryReturnType) => ({
          ...prev,
          data: [...reservationListWithoutUpdatedOne, reservationToUpdate],
        }),
      );

      return { prevReservationList };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
      });
      success("회의실 예약이 업데이트되었습니다.");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
        context?.prevReservationList,
      );
      error("회의실 예약 업데이트에 실패했습니다.");
    },
  });

  return {
    deleteRoomMutation: () => {
      openModal("deleteRoomReservationModal", {
        onConfirm: () => {
          deleteRoomMutation.mutate();
          clearStatus();
        },
      });
    },
    createRoomMutation: (re: RoomReservation) => {
      openModal("createRoomReservationModal", {
        onConfirm: () => {
          createRoomMutation.mutate(re);
          clearStatus();
        },
      });
    },
    updateRoomMutation: (re: RoomReservation) => {
      openModal("updateRoomReservationModal", {
        onConfirm: () => {
          updateRoomMutation.mutate(re);
          clearStatus();
        },
      });
    },
  };
};

export default useReservationAction;

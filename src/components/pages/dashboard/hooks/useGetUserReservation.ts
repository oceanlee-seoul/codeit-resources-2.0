import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import useAutoUpdateDate from "@/hooks/useAutoUpdateDate";
import { Reservation, ResourceType } from "@/lib/api/amplify/helper";
import { getReservationListByResourceType } from "@/lib/api/amplify/reservation";
import { getSeatResourceListByResourceStatus } from "@/lib/api/amplify/resource";
import { getCurrentTime } from "@/lib/utils/createTime";
import { convertTimeToMinutes } from "@/lib/utils/timeUtils";
import { userAtom } from "@/store/authUserAtom";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";

type ReservationData = Record<ResourceType, Reservation[]>;

export const useGetUserReservation = () => {
  const currentDate = useAutoUpdateDate();

  const [userReservations, setUserReservations] =
    useState<ReservationData | null>(null);
  const user = useAtomValue(userAtom);

  const getTodayUserReservation = useCallback(
    async (resourceType: ResourceType) => {
      const currentTime = getCurrentTime();

      const filter = {
        status: { eq: "CONFIRMED" },
        date: { eq: currentDate },
        endTime: { gt: currentTime },
        participants: { contains: user?.id },
      };

      const response = await getReservationListByResourceType(
        resourceType,
        filter,
      );

      if (response.errors) {
        throw new Error("Failed to fetch user reservations");
      }
      return response.data;
    },
    [user?.id, currentDate],
  );

  /* useSuspenseQueries에서 useQueries로 바꾸니까 타입오류나서 임의로 빈 배열 넣어놨어요 */
  const [
    { data: roomReservation = [] },
    { data: seatReservation = [] },
    { data: fixedSeats = { data: [] } },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, currentDate, user?.id],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: () => getTodayUserReservation("ROOM"),
      },
      {
        queryKey: [QUERY_KEY.SEAT_LIST, currentDate, user?.id],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: () => getTodayUserReservation("SEAT"),
      },
      {
        queryKey: [QUERY_KEY.SEAT_LIST, currentDate, user?.id],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: () => getSeatResourceListByResourceStatus("FIXED"),
      },
    ],
  });

  const userFixedSeat =
    fixedSeats?.data?.filter(({ owner }) => owner === user?.id) || [];

  const userFixedSeatReservation = [
    {
      id: "None",
      resourceId: "None",
      resourceType: "SEAT" as ResourceType,
      resourceSubtype: userFixedSeat[0]?.resourceSubtype,
      resourceName: userFixedSeat[0]?.name,
      resource: userFixedSeat[0] || {},
      startTime: "00:00",
      endTime: "24:00",
      status: "CONFIRMED",
      participants: [userFixedSeat[0]?.owner],
      date: "고정 좌석",
      createdAt: "",
      updatedAt: "",
    },
  ];

  const sortedRoomReservations = roomReservation?.sort(
    (a, b) =>
      (convertTimeToMinutes(a?.startTime) as number) -
      (convertTimeToMinutes(b?.startTime) as number),
  );

  useEffect(() => {
    setUserReservations({
      ROOM: sortedRoomReservations || [],
      // eslint-disable-next-line
      // @ts-ignore
      SEAT: userFixedSeat.length ? userFixedSeatReservation : seatReservation,
    });
  }, [roomReservation, seatReservation, fixedSeats]);

  return { userReservations };
};

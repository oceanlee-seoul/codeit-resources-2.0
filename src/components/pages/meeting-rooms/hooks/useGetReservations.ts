import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import { getResourceList } from "@/lib/api/amplify/resource";
import { getGroupedResourceListBySubtype } from "@/lib/api/amplify/resource/utils";
import { getMemberList } from "@/lib/api/amplify/team/utils";
import { getRoomReservationList } from "@/lib/api/reservation";
import { useQuery, useSuspenseQueries } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import pickedDateAtom from "../context/pickedDate";

export const useGetReservations = () => {
  const pickedDate = useAtomValue(pickedDateAtom) || "";

  const [{ data: rooms }, { data: members }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QUERY_KEY.ROOM_LIST, pickedDate],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: () => getResourceList({ resourceType: "ROOM" }),
      },

      {
        queryKey: [QUERY_KEY.MEMBER_LIST],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: () => getMemberList(),
      },
    ],
  });

  // 예약 데이터를 비동기적으로 가져오기 위한 useQuery
  const { data: roomReservations } = useQuery<{
    data: RoomReservation[] | [];
  }>({
    queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
    queryFn: () => getRoomReservationList({ date: pickedDate }),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: { data: [] },
  });

  // 리소스를 subtype별로 그룹화
  const groupedResources = useMemo(
    () => getGroupedResourceListBySubtype(rooms?.data as Resource[]),
    [rooms],
  );

  return { rooms: groupedResources, roomReservations, members };
};

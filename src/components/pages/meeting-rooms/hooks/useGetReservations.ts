import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { getResourceList } from "@/lib/api/amplify/resource";
import { getMemberList } from "@/lib/api/amplify/team/utils";
import { getRoomReservationList } from "@/lib/api/reservation";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import pickedDateAtom from "../context/pickedDate";

export const useGetReservations = () => {
  const pickedDate = useAtomValue(pickedDateAtom) || "";

  const [{ data: rooms }, { data: roomReservations }, { data: members }] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: [QUERY_KEY.ROOM_LIST, pickedDate],
          staleTime: DEFAULT_STALE_TIME,
          queryFn: () => getResourceList({ resourceType: "ROOM" }),
        },
        {
          queryKey: [QUERY_KEY.ROOM_RESERVATION_LIST, pickedDate],
          staleTime: DEFAULT_STALE_TIME,
          queryFn: () =>
            getRoomReservationList({
              date: pickedDate,
            }),
        },
        {
          queryKey: [QUERY_KEY.MEMBER_LIST],
          staleTime: DEFAULT_STALE_TIME,
          queryFn: () => getMemberList(),
        },
      ],
    });

  return { rooms, roomReservations, members };
};

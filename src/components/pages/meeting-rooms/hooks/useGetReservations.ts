import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { getReservationListByResourceType } from "@/lib/api/amplify/reservation";
import { getResourceList } from "@/lib/api/amplify/resource";
import { getTeamListData } from "@/lib/api/amplify/team";
import { getUserListData } from "@/lib/api/amplify/user";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import pickedDateAtom from "../context/pickedDate";

export const useGetReservations = () => {
  const pickedDate = useAtomValue(pickedDateAtom);

  const [
    { data: rooms },
    { data: roomReservations },
    { data: users },
    { data: teams },
  ] = useSuspenseQueries({
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
          getReservationListByResourceType("ROOM", {
            date: { eq: pickedDate },
            status: { eq: "CONFIRMED" },
          }),
      },
      {
        queryKey: [QUERY_KEY.USER_LIST, "0", "alphabetical"],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: () => getUserListData("0", "alphabetical"),
      },
      {
        queryKey: [QUERY_KEY.TEAM_LIST],
        staleTime: DEFAULT_STALE_TIME,
        queryFn: getTeamListData,
      },
    ],
  });

  return { rooms, roomReservations, users, teams };
};

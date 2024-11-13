import QUERY_KEY from "@/constants/queryKey";
import { useSuspenseQuery } from "@tanstack/react-query";

async function getAllSeatsData() {
  const response = await fetch("/api/admin/seats");
  return response.json();
}

export default function useGetAllSeatsData() {
  const { data: allSeatsData } = useSuspenseQuery({
    queryKey: [QUERY_KEY.SEAT_LIST_ADMIN],
    queryFn: getAllSeatsData,
    staleTime: 0,
  });

  return allSeatsData;
}

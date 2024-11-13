/* eslint-disable @typescript-eslint/no-use-before-define */
import { userAtom } from "@/store/authUserAtom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import mySeatInfoAtom from "../context/mySeatInfo";
import pickedDateAtom from "../context/pickedDate";

export default function useGetAllSeatsData() {
  const pickedDate = useAtomValue(pickedDateAtom);
  const userData = useAtomValue(userAtom);
  const setMySeatInfo = useSetAtom(mySeatInfoAtom);

  const {
    data: { allSeatsData, mySeatInfo },
  } = useSuspenseQuery({
    queryKey: ["seats", pickedDate, userData],
    queryFn: async () =>
      getAllSeatsData({ date: pickedDate, userId: userData?.id }),
    staleTime: 0,
  });

  useEffect(() => {
    setMySeatInfo({ ...mySeatInfo });
  }, [mySeatInfo]);

  return allSeatsData;
}

async function getAllSeatsData({
  date,
  userId,
}: {
  date: string;
  userId?: string;
}) {
  const query = new URLSearchParams({
    date,
  });
  if (userId) query.append("userId", userId);

  const response = await fetch(`/api/seats?${query}`);
  return response.json();
}

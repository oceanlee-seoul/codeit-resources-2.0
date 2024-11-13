import { SeatData } from "@/components/pages/admin/seats/types";
import { getSeatValidReservationList } from "@/lib/api/amplify/reservation";
import { getSeatResourceListByResourceStatus } from "@/lib/api/amplify/resource";
import { NextApiRequest, NextApiResponse } from "next";

const ALL_SEATS = {
  A: ["A0", "A1", "A2", "A3"],
  B: ["B0", "B1", "B2", "B3", "B4"],
  C: ["C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
  D: ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9"],
  E: ["E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
  F: ["F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"],
  G: ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"],
  H: ["H0", "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9"],
  I: ["I0", "I1", "I2", "I3", "I4"],
  J: ["J0", "J1", "J2", "J3", "J4"],
};

const initializeAllSeatsData = () =>
  Object.fromEntries(
    Object.entries(ALL_SEATS).map(([row, seats]) => [
      row,
      seats.map(
        (seat) =>
          ({
            name: seat,
            status: "enable",
          }) as SeatData,
      ),
    ]),
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const [
      { data: reservationArray },
      { data: disabledResourceArray },
      { data: fixedResourceArray },
    ] = await Promise.all([
      getSeatValidReservationList(),
      getSeatResourceListByResourceStatus("DISABLED"),
      getSeatResourceListByResourceStatus("FIXED"),
    ]);

    const allSeatsData = initializeAllSeatsData();

    // 고정 좌석에 대한 데이터를 정렬합니다.
    fixedResourceArray.forEach(({ resourceSubtype, name, owner }) => {
      const row = allSeatsData[resourceSubtype as string];
      const seatIndex = row?.find((seat) => seat.name === name);
      if (seatIndex) {
        seatIndex.status = "fixed";
        seatIndex.participant = owner as string;
      }
    });

    // 사용 불가 좌석에 대한 데이터를 정렬합니다.
    disabledResourceArray.forEach(({ resourceSubtype, name }) => {
      const row = allSeatsData[resourceSubtype as string];
      const seatIndex = row?.find((seat) => seat.name === name);
      if (seatIndex) {
        seatIndex.status = "disabled";
      }
    });

    // 예약 좌석에 대한 데이터를 정렬합니다.
    reservationArray.forEach(({ resourceSubtype, resourceName }) => {
      const row = allSeatsData[resourceSubtype as string];
      const seatIndex = row?.find((seat) => seat.name === resourceName);
      if (seatIndex) {
        seatIndex.status = "confirmed";
      }
    });

    return res.status(200).json(allSeatsData);
  } catch {
    return res
      .status(500)
      .json({ error: "Failed to fetch and organize seat data" });
  }
}

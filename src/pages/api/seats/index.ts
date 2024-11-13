import { SeatData } from "@/components/pages/seats/types";
import { getSeatReservationListByDate } from "@/lib/api/amplify/reservation";
import { getSeatResourceListByResourceStatus } from "@/lib/api/amplify/resource";
import { NextApiRequest, NextApiResponse } from "next";

interface FixedSeatInfo {
  status: "fixed";
  reservationId?: never;
  seatName: string;
}

interface ConfirmedSeatInfo {
  status: "confirmed";
  reservationId: string;
  seatName: string;
}

type MySeatInfo = FixedSeatInfo | ConfirmedSeatInfo | null;

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
  const { date, userId } = req.query;

  if (typeof date !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const [
      { data: reservationArray },
      { data: disabledResourceArray },
      { data: fixedResourceArray },
    ] = await Promise.all([
      getSeatReservationListByDate(date),
      getSeatResourceListByResourceStatus("DISABLED"),
      getSeatResourceListByResourceStatus("FIXED"),
    ]);

    const allSeatsData = initializeAllSeatsData();
    let mySeatInfo: MySeatInfo = null;

    // 고정 좌석에 대한 데이터를 정렬합니다.
    fixedResourceArray.forEach(({ resourceSubtype, name, owner }) => {
      const row = allSeatsData[resourceSubtype as string];
      const seatIndex = row?.find((seat) => seat.name === name);
      if (seatIndex) {
        seatIndex.status = "fixed";
        seatIndex.participant = owner as string;
      }

      if (owner === userId) {
        mySeatInfo = {
          status: "fixed",
          seatName: name,
        };
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
    reservationArray.forEach(
      ({ id, resourceSubtype, resourceName, participants }) => {
        const row = allSeatsData[resourceSubtype as string];
        const seatIndex = row?.find((seat) => seat.name === resourceName);
        if (seatIndex) {
          seatIndex.status = "confirmed";
          const [oneAndOnlyParticipant] = participants as string[];
          seatIndex.participant = oneAndOnlyParticipant;
        }

        if (userId && participants?.[0] === userId) {
          mySeatInfo = {
            status: "confirmed",
            reservationId: id,
            seatName: resourceName,
          };
        }
      },
    );

    return res.status(200).json({ allSeatsData, mySeatInfo });
  } catch {
    return res
      .status(500)
      .json({ error: "Failed to fetch and organize seat data" });
  }
}

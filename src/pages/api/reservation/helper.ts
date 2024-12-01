import { Member } from "@/components/commons/Dropdown/dropdownType";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import * as amplifyUtils from "@/lib/api/amplify/reservation";
import { getResourceList } from "@/lib/api/amplify/resource";
import { getMemberList } from "@/lib/api/amplify/team/utils";
import { createEvent, getEvents, updateEvent } from "@/lib/api/googleCalendar";
import {
  googleEventToReservation,
  reservationToGoogleEvent,
} from "@/lib/api/googleCalendar/helper";
import { GoogleCalendarEventRequest } from "@/lib/types/google-calendar";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT, getToken } from "next-auth/jwt";

export const getRoomReservationList = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { accessToken } = (await getToken({ req })) as JWT;

  const members = await getMemberList();
  const response = await getResourceList({ resourceType: "ROOM" });

  const rooms = response?.data as Resource[];
  const params = req.query;

  const googleParams = {
    // 쿼리키 검색으로 참여자 조회
    ...(params.q ? { q: params.q } : {}),
    maxResults: 100,
    showDeleted: false,
    // 조회를 시작할 시간(start) ~ 끝낼 (end)
    timeMax: `${params.date}T${params.endTime || "23:59"}:00+09:00`,
    timeMin: `${params.date}T${params.startTime || "00:00"}:00+09:00`,
    timeZone: "Asia/Seoul",
    singleEvents: true,
  };

  try {
    let googleEvents;

    if (params.calendarId) {
      // 단일 캘린더 데이터
      const calendarEvents = await getEvents(
        params.calendarId as string,
        accessToken || "",
        googleParams,
      );
      googleEvents = calendarEvents.items;
    } else {
      // 전체 캘린더(리소스) 데이터
      const googleEventsArray = await Promise.all(
        rooms?.map((room: Resource) =>
          getEvents(
            room.googleResourceId || "",
            accessToken || "",
            googleParams,
          ),
        ),
      );
      googleEvents = googleEventsArray.reduce(
        (acc, event) => acc.concat(event.items),
        [],
      );
    }

    if (googleEvents) {
      // 구글 캘린더 이벤트가 존재하면 dynamoDB 데이터 스키마 형식으로 변환
      const amplifyData: RoomReservation[] = await Promise.all(
        googleEvents?.map(async (event: GoogleCalendarEventRequest) => {
          const data = await googleEventToReservation(event, members);
          return data?.status !== "CANCELED" ? data : null; // 상태가 CANCELED가 아니면 반환
        }),
      );

      // null이나 undefined를 제거하고 RoomReservation 타입만 포함
      const filteredAmplifyData = amplifyData.filter(Boolean);
      return res.status(201).json(filteredAmplifyData);
    }
    return res.status(500).json({ error: "Failed to get events" });
    // eslint-disable-next-line
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createReservation = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { email, accessToken } = (await getToken({ req })) as JWT;

  const calendarID = email || "";
  const reservation = req.body;
  const event = await reservationToGoogleEvent(reservation, { email });

  try {
    const createdEvent = await createEvent(
      calendarID,
      event,
      accessToken || "",
    );
    if (createdEvent) {
      const amplifyData = await amplifyUtils.createReservation({
        ...reservation,
        participants:
          reservation.participants?.map(
            (participant: Member) => participant.id,
          ) || [],
        googleEventId: createdEvent.id,
      });
      if (amplifyData) {
        return res.status(201).json(amplifyData);
      }
    }
    return res.status(500).json({ error: "Failed to create event" });
    // eslint-disable-next-line
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateReservation = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { email, accessToken } = (await getToken({ req })) as JWT;

  const calendarID = email || "primary";
  const { data: reservation, user } = req.body;
  const event = await reservationToGoogleEvent(reservation, { email });

  const { reservationId } = req.query;
  const isOnlyGoogleEvent =
    typeof reservationId === "string" &&
    reservationId?.startsWith("googleCalendar");

  const eventID = reservation?.googleEventId;
  if (!eventID) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const members = await getMemberList();

  try {
    const updatedEvent = await updateEvent(
      calendarID,
      eventID,
      event,
      accessToken || "",
    );

    if (updatedEvent) {
      if (!isOnlyGoogleEvent) {
        const amplifyData = await amplifyUtils.updateReservation(
          {
            ...reservation,
            participants:
              reservation.participants?.map(
                (participant: Member) => participant.id,
              ) || [],
          },
          user,
        );
        if (amplifyData) {
          return res.status(201).json(amplifyData);
        }
      } else {
        // 구글 캘린더에만 있는 데이터는 구글 캘린더 업데이트 데이터를 변환해서 전달
        const returnData = await googleEventToReservation(
          updatedEvent,
          members,
        );
        return res.status(201).json(returnData);
      }
    }
    return res.status(500).json({ error: "Failed to update event" });
    // eslint-disable-next-line
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

import { Member } from "@/components/commons/Dropdown/dropdownType";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import * as amplifyUtils from "@/lib/api/amplify/reservation";
import { getResourceList } from "@/lib/api/amplify/resource";
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
  };

  try {
    let googleEvents;
    if (params.calendarId) {
      const calendarEvents = await getEvents(
        params.calendarId as string,
        accessToken || "",
        googleParams,
      );
      googleEvents = calendarEvents.items;
    } else {
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
        (acc, event) => [...acc, ...event.items],
        [],
      );
    }

    // console.log(
    //   "googleEvents",
    //   googleEvents.items.length,
    //   JSON.stringify(googleEvents.items),
    // );
    if (googleEvents) {
      /** REVIEW
       * 1. 구글캘린더 데이터를 가져와서 렌더링 (현재)
       * 2. amplify DB 데이터를 가져와서 렌더링
       * 3. 구글캘린더, amplify DB 데이터 모두 가져온 뒤 item 수 비교해서 따로 처리해주기
       *
       */
      // const amplifyData = await amplifyUtils.getReservationListByResourceType(
      //   "ROOM",
      //   amplifyParams,
      // );
      const amplifyData: RoomReservation[] = await Promise.all(
        googleEvents.map((event: GoogleCalendarEventRequest) =>
          googleEventToReservation(event),
        ),
      );
      return res.status(201).json(amplifyData);
    }
    return res.status(500).json({ error: "Failed to get events" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getMyRoomReservationList = async () => {};

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
    // console.log("createdEvent", createdEvent);
    if (createdEvent) {
      const amplifyData = await amplifyUtils.createReservation({
        ...reservation,
        participants:
          reservation.participants?.map(
            (participant: Member) => participant.id,
          ) || [],
        googleEventId: createdEvent.id,
      });
      // console.log("amplifyData", amplifyData);
      if (amplifyData) {
        return res.status(201).json(amplifyData);
      }
    }
    return res.status(500).json({ error: "Failed to create event" });
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
  // console.log("event", event);
  const { reservationId } = req.query;
  const isOnlyGoogleEvent =
    typeof reservationId === "string" &&
    reservationId?.startsWith("googleCalendar");

  const eventID = reservation?.googleEventId;
  if (!eventID) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

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
        const returnData = await googleEventToReservation(updatedEvent);
        return res.status(201).json(returnData);
      }
    }
    return res.status(500).json({ error: "Failed to update event" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

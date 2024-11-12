import { Reservation, client } from "@/lib/api/amplify/helper";
import * as amplifyUtils from "@/lib/api/amplify/reservation";
import { createEvent, getEvents, updateEvent } from "@/lib/api/googleCalendar";
import {
  googleEventToReservation,
  reservationToGoogleEvent,
} from "@/lib/api/googleCalendar/helper";
import { GoogleCalendarEventRequest } from "@/lib/types/google-calendar";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT, getToken } from "next-auth/jwt";

export const getReservationList = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { accessToken } = (await getToken({ req })) as JWT;

  // TODO 정렬 처리
  // const orderBy = req.query.orderBy as string;

  const params = req.query;

  try {
    // const googleEvents = await getEvents(calendarID || "", accessToken || "");
    const googleEvents = await getEvents(
      "c_1880l1li4dikehesi178q5s3pfn4a@resource.calendar.google.com",

      accessToken || "",
      {
        ...params,
        calendarId: "primary",
        maxResults: 100,
        showDeleted: false,
        timeMax: "2024-11-12T19:00:00+09:00",
        timeMin: "2024-11-11T19:00:00+09:00",
      },
    );
    // console.log("googleEvents", googleEvents);
    if (googleEvents) {
      const amplifyData = googleEvents.items.map(
        (event: GoogleCalendarEventRequest) => googleEventToReservation(event),
      );
      // console.log("amplifyData", amplifyData);
      return res.status(201).json(amplifyData);
    }
    return res.status(500).json({ error: "Failed to get events" });
  } catch (error) {
    console.error(error);
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
  const event = reservationToGoogleEvent(reservation);

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
        googleEventId: createdEvent.id,
      });
      // console.log("amplifyData", amplifyData);
      if (amplifyData) {
        return res.status(201).json(amplifyData);
      }
    }
    return res.status(500).json({ error: "Failed to create event" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateReservation = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { email, accessToken } = (await getToken({ req })) as JWT;

  const calendarID = "primary";
  const { data: reservation, user } = req.body;
  const event = reservationToGoogleEvent(reservation);
  const eventID = reservation.googleEventId;

  try {
    const updatedEvent = await updateEvent(
      calendarID,
      eventID,
      event,
      accessToken || "",
    );
    if (updatedEvent) {
      const amplifyData = await amplifyUtils.updateReservation(
        reservation,
        user,
      );
      if (amplifyData) {
        return res.status(201).json(amplifyData);
      }
    }
    return res.status(500).json({ error: "Failed to update event" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

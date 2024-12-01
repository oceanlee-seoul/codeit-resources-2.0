import { Member } from "@/components/commons/Dropdown/dropdownType";
import { GoogleCalendarEventRequest } from "@/lib/types/google-calendar";
import axios from "axios";
import { JWT } from "next-auth/jwt";

import { Reservation, RoomReservation, client } from "../amplify/helper";

export const BASE_URL = "https://www.googleapis.com/calendar/v3";

/**
 * 각 엔드포인트에 동적으로 필요한 ID를 추가하는 함수
 */
export const END_POINTS = {
  calendarList: `/users/me/calendarList`,

  // 기본 유저 calenderID는 소셜 로그인 계정 메일입니다. 예) eprnf21@dev.resource.codeit.kr
  events: (calendarID: string) => `/calendars/${calendarID}/events`,

  event: (calendarID: string, eventID: string) =>
    `/calendars/${calendarID}/events/${eventID}`,
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Reservation -> GoogleCalendarEvent 변환 함수
export async function reservationToGoogleEvent(
  reservation: Omit<Reservation, "participants"> & { participants?: Member[] },
  jwt?: JWT,
): Promise<GoogleCalendarEventRequest> {
  const { data: amplifyResource, errors } = await client.models.Resource.get({
    id: reservation.resourceId,
  });
  if (errors || !amplifyResource || !amplifyResource.googleResourceId) {
    throw new Error(
      "Failed to fetch resource info from Amplify or Google Calendar Id is null",
    );
  }
  const formattedParticipants =
    reservation?.participants?.map((participant) => ({
      email: participant.email || "",
      organizer: jwt?.email === participant.email,
    })) ?? [];

  return {
    ...(reservation.status === "CANCELED" ? { status: "cancelled" } : {}),
    summary: reservation?.title || "",
    start: {
      dateTime: `${reservation.date}T${reservation.startTime}:00+09:00`,
      timeZone: "Asia/Seoul",
    },
    end: {
      dateTime: `${reservation.date}T${reservation.endTime}:00+09:00`,
      timeZone: "Asia/Seoul",
    },

    attendees: [
      ...formattedParticipants,
      {
        email: amplifyResource.googleResourceId,
        resource: true,
      },
    ],
    reminders: {
      useDefault: true,
    },
  };
}

const DATE_TIME_REGEX = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;

// GoogleCalendarEvent -> Reservation 변환 함수
export async function googleEventToReservation(
  event: GoogleCalendarEventRequest,
  members: Member[],
): Promise<Partial<RoomReservation> | null> {
  if (
    !event?.start?.dateTime ||
    !event?.end?.dateTime ||
    event?.attendees?.length === 0
  ) {
    return null;
  }

  // ["fullDate", "YYYY-MM-DD", "HH:mm"]
  const startDateTime = event.start.dateTime?.match(DATE_TIME_REGEX) ?? [];
  const endDateTime = event.end.dateTime?.match(DATE_TIME_REGEX) ?? [];

  const resource =
    event?.attendees?.find((attendee) => attendee?.resource) ?? {};

  const { data: amplifyResource, errors } = await client.models.Resource.list({
    filter: {
      googleResourceId: { eq: resource?.email },
    },
  });

  if (
    !resource?.email ||
    errors ||
    amplifyResource.length === 0 ||
    !startDateTime?.[1] ||
    !endDateTime?.[1]
  ) {
    return null;
  }

  const formattedParticipants = event?.attendees?.reduce(
    (acc: Member[], attendee) => {
      const memberData = members.find(
        (member) => member.email === attendee.email,
      );
      if (memberData) {
        acc.push(memberData);
      } else if (attendee?.resource) {
        return acc;
      } else {
        acc.push({
          id: `temp-${attendee.email}`,
          name: attendee.email?.split("@")?.[0] || "unknown",
          email: attendee.email,
          teams: [],
          profileImage: null,
        });
      }
      return acc;
    },
    [],
  );

  const { data: reservation } = await client.models.Reservation.list({
    filter: { googleEventId: { eq: event?.id || "" } },
  });

  const status =
    resource?.responseStatus === "cancelled" ||
    resource?.responseStatus === "declined"
      ? "CANCELED"
      : "CONFIRMED";

  return {
    id: reservation?.[0]?.id || `googleCalenderOnly-${event.id}`,
    title: event?.summary || "",
    resourceId: amplifyResource[0]?.id || "",
    resourceType: amplifyResource[0]?.resourceType || "ROOM",
    resourceSubtype: amplifyResource[0]?.resourceSubtype || "",
    resourceName: amplifyResource[0]?.name || "",

    date: startDateTime?.[1] || "1980-01-01",
    startTime: startDateTime?.[2] || "00:00",
    endTime: endDateTime?.[2] || "01:00",

    status,
    participants: formattedParticipants || [],
    googleEventId: event.id,
  };
}

import { GoogleCalendarEventRequest } from "@/lib/types/google-calendar";
import axios from "axios";

import { Reservation, ReservationStatus } from "../amplify/helper";

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
export function reservationToGoogleEvent(
  reservation: Reservation,
): GoogleCalendarEventRequest {
  return {
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
      // { email: reservation.resourceId, resource: true },
      // 오렌지 1로 고정
      {
        email: "c_1880l1li4dikehesi178q5s3pfn4a@resource.calendar.google.com",
        resource: true,
        responseStatus:
          reservation.status === "CANCELED" ? "declined" : "accepted",
      },
      { email: "eprnf21@dev.resource.codeit.kr", organizer: true },
      //
      //    {
      //   "email": "eprnf21@dev.resource.codeit.kr",
      //   "organizer": true,
      //   "responseStatus": "accepted"
      // },
      // ...reservation.participants.map((participant) => ({
      //   email: participant,
      // })),
    ],
    reminders: {
      useDefault: true,
    },
  };
}

const DATE_TIME_REGEX = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;

// GoogleCalendarEvent -> Reservation 변환 함수
export function googleEventToReservation(
  event: GoogleCalendarEventRequest,
): Partial<Reservation> {
  if (!event.start.dateTime || !event.end.dateTime || !event.attendees) {
    throw new Error("Google Calendar Event is not valid.");
  }

  // ["YYYY-MM-DD", "HH:mm"]
  const startDateTime = event.start.dateTime.match(DATE_TIME_REGEX) ?? [];
  const endDateTime = event.end.dateTime.match(DATE_TIME_REGEX) ?? [];

  const resource = event.attendees.find((attendee) => attendee.resource) ?? {};

  return {
    title: event.summary,
    // resourceId: resource?.email || "",
    resourceId: "a69da7e9-32b0-46b5-b4a4-6bbca7c85fe1",
    resourceType: "ROOM", // 외부 데이터 소스로부터 결정
    resourceSubtype: "오렌지룸", // 외부 데이터 소스로부터 결정
    resourceName: "오렌지룸A", // 외부 데이터 소스로부터 결정

    date: startDateTime[1],
    startTime: startDateTime[2],
    endTime: endDateTime[2],

    status: (resource.responseStatus as ReservationStatus) || "CANCELED",
    // participants: event.attendees
    //   .filter((attendee) => !attendee.resource)
    //   .map((attendee) => attendee.email),

    googleEventId: event.id,
  };
}

import { Reservation, User } from "./amplify/helper";
import { axiosInstance, handleAxiosError } from "./helper";

export const getRoomReservationList = async () => {
  try {
    const response = await axiosInstance.get(`/reservation`, {
      params: {
        // calendarId: resource.googleResourceId
        timeMax: "2024-11-12T19:00:00+09:00",
        timeMin: "2024-11-11T19:00:00+09:00",
      },
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getRoomReservation = async (reservationId: string) => {
  try {
    const response = await axiosInstance.get(`/reservation/${reservationId}`);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const createReservation = async (data: Reservation) => {
  try {
    const response = await axiosInstance.post(`/reservation`, data);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateReservation = async (data: Reservation, user: User) => {
  try {
    const response = await axiosInstance.patch(`/reservation/${data.id}`, {
      data,
      user,
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const cancelReservation = async (data: Reservation, user: User) => {
  try {
    const response = await axiosInstance.patch(`/reservation/${data.id}`, {
      data: { ...data, status: "CANCELED" },
      user,
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

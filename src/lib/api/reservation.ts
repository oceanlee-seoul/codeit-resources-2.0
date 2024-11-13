import { RoomReservation, User } from "./amplify/helper";
import { axiosInstance, handleAxiosError } from "./helper";

export const getRoomReservationList = async (
  params: Record<string, string>,
) => {
  try {
    const response = await axiosInstance.get(`/reservation`, {
      params,
    });
    return response;
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

export const createReservation = async (data: RoomReservation) => {
  try {
    const response = await axiosInstance.post(`/reservation`, data);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateReservation = async (data: RoomReservation, user: User) => {
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

export const cancelReservation = async (data: RoomReservation, user: User) => {
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

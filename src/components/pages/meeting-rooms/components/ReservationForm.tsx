import Button from "@/components/commons/Button";
import Dropdown from "@/components/commons/Dropdown";
import MembersSelectDropdown from "@/components/commons/Dropdown/MultiSelectDropdown/MembersSelectDropdown";
import { Member } from "@/components/commons/Dropdown/dropdownType";
import Input from "@/components/commons/Input";
import { ALL_TIME_SLOT_ITEMS, TIME_SLOT_ITEMS } from "@/constants/timeSlot";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import { userAtom } from "@/store/authUserAtom";
import { todayDateAtom } from "@/store/todayDateAtom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { pickedDateAtom, pickedReservationAtom } from "../context";
import useReservationAction from "../hooks/useReservationAction";
import useReservationSchema from "../hooks/useReservationSchema";

interface ReservationFormProps {
  rooms: Resource[];
  members: Member[];
}

function ReservationForm({ rooms, members }: ReservationFormProps) {
  const currentUser = useAtomValue(userAtom);
  const pickedDate = useAtomValue(pickedDateAtom);
  const today = useAtomValue(todayDateAtom);
  const timeSlotItems =
    today.format("YYYY-MM-DD") === pickedDate
      ? TIME_SLOT_ITEMS
      : ALL_TIME_SLOT_ITEMS;

  const [pickedReservation, setPickedReservation] = useAtom(
    pickedReservationAtom,
  );
  const { createRoomMutation, updateRoomMutation } = useReservationAction();
  const reservationSchema = useReservationSchema();

  const defaultReservation = useMemo(
    () => ({
      title: pickedReservation?.title || "",
      resourceId: pickedReservation?.resourceId || "",
      startTime: pickedReservation?.startTime || "",
      endTime: pickedReservation?.endTime || "",
      participants: pickedReservation?.participants?.length
        ? pickedReservation.participants
            .map((participant) =>
              members.find((member) => member.email === participant.email),
            )
            .filter((member): member is Member => member !== undefined)
        : members.filter((member) => member.id === currentUser?.id),
      googleEventId: pickedReservation?.googleEventId || "",
    }),
    [pickedReservation, members, currentUser],
  );

  const methods = useForm<RoomReservation>({
    defaultValues: defaultReservation,
    resolver: zodResolver(reservationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { handleSubmit, control, watch, reset, formState } = methods;

  const resourceId = watch("resourceId");
  const resource = rooms?.find((room) => room.id === resourceId);
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const title = watch("title");
  const participants = watch("participants");

  const onSubmit = async (data: RoomReservation) => {
    if (!pickedDate) {
      throw new Error("날짜를 선택해주세요.");
    }

    const formData = {
      ...data,
      date: pickedDate,
      id: pickedReservation?.id,
      googleEventId: pickedReservation?.googleEventId || "",
    };

    try {
      // eslint-disable-next-line
      pickedReservation?.id
        ? await updateRoomMutation(formData as RoomReservation)
        : await createRoomMutation(formData as RoomReservation);
    } catch (error) {
      throw error;
    }
  };

  // 폼데이터 변경에 따라 실시간으로 전역상태를 업데이트하는 useEffect
  useEffect(() => {
    if (startTime && endTime && resourceId) {
      setPickedReservation((prev) => ({
        ...prev,
        title,
        startTime,
        endTime,
        resourceName: resource?.name || "",
        resourceSubtype: resource?.resourceSubtype || "",
        resourceId,
        participants,
      }));
    }
  }, [participants?.length, startTime, endTime, resourceId]);

  // 폼데이터 변경 또는 전역상태 pickedReservation 변경에 따라 폼 데이터를 변경시켜주는 useEffect
  useEffect(() => {
    reset(defaultReservation);
    if (pickedReservation) methods.trigger();
  }, [pickedReservation, members, currentUser?.id]);

  return (
    <FormProvider {...methods}>
      <form
        className="relative flex h-full w-full flex-col gap-y-16 pb-32 pt-24 [&_input]:text-16-400"
        onSubmit={handleSubmit(onSubmit)}
      >
        {pickedReservation?.id?.startsWith("google") && (
          <span className="absolute right-0 top-0 text-12-500 text-purple-600">
            * <b>Google Calendar</b>를 통해 예약된 회의에요
          </span>
        )}

        <Input
          id="title"
          label="미팅 제목"
          register={methods.register("title")}
          errorMessage={title ? formState.errors.title?.message : undefined}
        />

        <Controller
          name="resourceId"
          control={control}
          rules={{ required: "회의실을 선택해주세요." }}
          render={({ field: { onChange }, fieldState: { error } }) => (
            <Dropdown
              variant="meetingRoom"
              value={pickedReservation?.resourceName || ""}
              onChange={(selectedId) => {
                onChange(selectedId);
              }}
            >
              <Dropdown.Toggle
                isError={!!error}
                errorMessage={error ? error.message : ""}
              />
              <Dropdown.Wrapper>
                {rooms?.map((room) => (
                  <Dropdown.Item
                    key={room.id}
                    itemValue={room.id}
                    label={room.name}
                  />
                ))}
              </Dropdown.Wrapper>
            </Dropdown>
          )}
        />

        <fieldset className="inline-flex gap-16 [&>div]:grow">
          <div className="w-1/2 [&_svg]:shrink-0">
            <Controller
              name="startTime"
              control={control}
              rules={{ required: "필수 입력" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Dropdown variant="startTime" value={value} onChange={onChange}>
                  <Dropdown.Toggle
                    isError={!!error}
                    errorMessage={error ? error.message : ""}
                  />
                  <Dropdown.Wrapper>
                    <Dropdown.ManualItem>직접 입력</Dropdown.ManualItem>
                    {timeSlotItems.map((item) => (
                      <Dropdown.Item key={item} itemValue={item} />
                    ))}
                  </Dropdown.Wrapper>
                </Dropdown>
              )}
            />
          </div>

          <div className="w-1/2 [&_svg]:shrink-0">
            <Controller
              name="endTime"
              control={control}
              rules={{ required: "필수 입력" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Dropdown
                  variant="endTime"
                  value={value}
                  onChange={(selectedTime) => {
                    // 24:00이 선택되면 23:59로 변환
                    const adjustedTime =
                      selectedTime === "24:00" ? "23:59" : selectedTime;
                    onChange(adjustedTime);
                  }}
                >
                  <Dropdown.Toggle
                    isError={!!error}
                    errorMessage={error ? error.message : ""}
                  />
                  <Dropdown.Wrapper>
                    <Dropdown.ManualItem>직접 입력</Dropdown.ManualItem>
                    {timeSlotItems.map((item) => (
                      <Dropdown.Item key={item} itemValue={item} />
                    ))}
                  </Dropdown.Wrapper>
                </Dropdown>
              )}
            />
          </div>
        </fieldset>

        <Controller
          name="participants"
          control={control}
          rules={{ required: "참여자를 선택해주세요." }}
          render={({ field: { value, onChange } }) => (
            <MembersSelectDropdown
              selectedMembers={value}
              onSelect={(member) => {
                onChange([...value, member]);
              }}
              onRemove={(member) => {
                onChange(value.filter((m) => m.id !== member.id));
              }}
              allMembers={members}
              disabledMembers={currentUser ? [currentUser.id] : []}
            />
          )}
        />

        <div className="mt-auto">
          <Button variant="primary" type="submit" disabled={!formState.isValid}>
            {pickedReservation?.id ? "예약 수정" : "예약하기"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default ReservationForm;

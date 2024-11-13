import { Resource } from "@/lib/api/amplify/helper";
import clsx from "clsx";

import { TimeSlot } from "./TimeLineType";

const GroupBorderStyle = {
  gray: (isFirst: boolean = false, isLast: boolean = false) =>
    clsx(
      `bg-[#3332361A] [&_.time-slot-bar]:bg-gray-80`, // 배경색 지정
      {
        // 단일 박스 (모든 보더)
        "shadow-[inset_0_0_0_1px_#413B541A]": isFirst && isLast,
        // 시작 박스 (왼쪽 보더 포함)
        "shadow-[inset_1px_1px_0px_0px_#413B541A,inset_0px_-1px_0px_0px_#413B541A]":
          isFirst && !isLast,
        // 끝 박스 (오른쪽 보더 포함)
        "shadow-[inset_-1px_1px_0px_0px_#413B541A,inset_0px_-1px_0px_0px_#413B541A]":
          isLast && !isFirst,
        // 중간 박스 (가로 보더만)
        "shadow-[inset_0px_1px_0px_0px_#413B541A,inset_0px_-1px_0px_0px_#413B541A]":
          !isFirst && !isLast,
      },
    ),
  purple: (isFirst: boolean = false, isLast: boolean = false) =>
    clsx(`bg-[#9933FF1A]`, {
      "shadow-[inset_0_0_0_1px_#D4A4F9]": isFirst && isLast,
      "shadow-[inset_1px_1px_0px_0px_#D4A4F9,inset_0px_-1px_0px_0px_#D4A4F9]":
        isFirst && !isLast,
      "shadow-[inset_0px_1px_0px_0px_#D4A4F9,inset_0px_-1px_0px_0px_#D4A4F9]":
        !isFirst && !isLast,
      "shadow-[inset_-1px_1px_0px_0px_#D4A4F9,inset_0px_-1px_0px_0px_#D4A4F9]":
        !isFirst && isLast,
    }),
  red: (isFirst: boolean = false, isLast: boolean = false) =>
    clsx(`bg-[#FBDBE366]`, {
      "shadow-[inset_0_0_0_1px_#D6173A66]": isFirst && isLast,
      "shadow-[inset_1px_1px_0px_0px_#D6173A66,inset_0px_-1px_0px_0px_#D6173A66]":
        isFirst && !isLast,
      "shadow-[inset_0px_1px_0px_0px_#D6173A66,inset_0px_-1px_0px_0px_#D6173A66]":
        !isFirst && !isLast,
      "shadow-[inset_-1px_1px_0px_0px_#D6173A66,inset_0px_-1px_0px_0px_#D6173A66]":
        !isFirst && isLast,
    }),
};

const getTimeSlotStyle = (
  slot: TimeSlot,
  room: Resource,
  status: Record<string, unknown>,
) => {
  const {
    isHovered,
    isFirstInHoverGroup,
    isLastInHoverGroup,
    isPicked,
    isFirstInPickedGroup,
    isLastInPickedGroup,
  } = slot;
  const { isMyReservation, isConflictReservation } = status;
  const isMyReservationOrPicked = isMyReservation || isPicked;

  const myReservationClass = {
    TIME_SLOT_BAR: isMyReservationOrPicked && "bg-purple-70",
    TIME_SLOT_HOVER_GROUP: isHovered &&
      isMyReservationOrPicked && {
        "bg-[#9933FF1A]": !isConflictReservation,
        "bg-[#FBDBE366]": isConflictReservation,
      },
  };

  const pickedReservationClass = {
    TIME_SLOT_BAR:
      isPicked && ((isConflictReservation && "bg-red-600") || "bg-purple-70"),
    TIME_SLOT_HOVER_GROUP:
      isPicked &&
      ((isConflictReservation &&
        GroupBorderStyle.red(isFirstInHoverGroup, isLastInHoverGroup)) ||
        GroupBorderStyle.purple(isFirstInHoverGroup, isLastInHoverGroup)),
    TIME_SLOT_GROUP:
      isPicked &&
      ((isConflictReservation &&
        GroupBorderStyle.red(isFirstInPickedGroup, isLastInPickedGroup)) ||
        GroupBorderStyle.purple(isFirstInPickedGroup, isLastInPickedGroup)),
  };

  const otherReservationClass = {
    TIME_SLOT_BAR: !isMyReservation && "bg-gray-40",
    TIME_SLOT_HOVER_GROUP:
      !isMyReservation &&
      GroupBorderStyle.gray(isFirstInHoverGroup, isLastInHoverGroup),
  };

  const timeSlotBarClass = clsx(
    pickedReservationClass.TIME_SLOT_BAR,
    myReservationClass.TIME_SLOT_BAR,
    otherReservationClass.TIME_SLOT_BAR,
  );

  const generalTimeSlotClass = {
    TIME_SLOT_BACKGROUND: slot.isHovered && "bg-[#3332361A]",
    TIME_SLOT_BORDER: slot.isHovered && {
      // 일반 예약 (회색)
      [GroupBorderStyle.gray(isFirstInHoverGroup, isLastInHoverGroup)]:
        !isMyReservationOrPicked,

      // 내 예약 또는 선택된 예약 (보라색)
      [GroupBorderStyle.purple(isFirstInHoverGroup, isLastInHoverGroup)]:
        isMyReservationOrPicked && !isConflictReservation,

      // 충돌하는 예약 (빨간색)
      [GroupBorderStyle.red(isFirstInHoverGroup, isLastInHoverGroup)]:
        isPicked && isConflictReservation,
    },
  };

  const timeSlotHoverGroupClass = clsx(
    // 호버 시 배경색 클래스
    generalTimeSlotClass.TIME_SLOT_BACKGROUND,
    // 나의 예약이거나 선택된 예약인 경우
    myReservationClass.TIME_SLOT_HOVER_GROUP,
    // 보더 스타일
    generalTimeSlotClass.TIME_SLOT_BORDER,
  );

  return { pickedReservationClass, timeSlotHoverGroupClass, timeSlotBarClass };
};
export { GroupBorderStyle, getTimeSlotStyle };

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Member } from "@/components/commons/Dropdown/dropdownType";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import XButton from "@public/icons/icon-x-button.svg";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { LegacyRef, forwardRef } from "react";

import { pickedReservationAtom } from "../../context";
import useReservationAction from "../../hooks/useReservationAction";
import useTimeSlot from "../../hooks/useTimeSlot";
import { BottomDottedBar, TimeVerticalLine } from "./TimeLineBackground";
import { TimeSlot } from "./TimeLineType";
import { TimeText } from "./TimeText";
import { Tooltip } from "./Tooltip";
import { getTimeSlotStyle } from "./getTimeSlotStyle";

export function ReservationBar({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "time-slot-bar absolute top-21 z-timeline-slot h-12 w-48 md:top-16 md:w-[72px]",
        className,
      )}
    />
  );
}

export interface ThirtyMinutesTimeBoxProps {
  slot: TimeSlot;
  onHoverGroup: (id?: string) => void;
  isHeaderShow: boolean;
  room: Resource;
  hoveredReservationId: string;
}
function ThirtyMinutesTimeBox(
  {
    slot,
    onHoverGroup,
    isHeaderShow,
    room,
    hoveredReservationId,
  }: ThirtyMinutesTimeBoxProps,
  ref: LegacyRef<HTMLDivElement>,
) {
  const { time, reservation, isCurrentTimePeriod, isHalfHour, isPicked } = slot;
  const is24Hour = time === "24:00";
  const handleMutation = useReservationAction(reservation as RoomReservation);
  const pickedReservation = useAtomValue(pickedReservationAtom);

  const {
    isMyReservation,
    isMyReservationNotExpired,
    isConflictReservation,
    handleClick,
    isPastTime,
  } = useTimeSlot({
    slot,
    room,
  });

  const handleMouseEnter = () => {
    if (!pickedReservation && reservation?.id) onHoverGroup(reservation.id);
  };
  const handleMouseLeave = () => {
    onHoverGroup(undefined);
  };

  const { pickedReservationClass, timeSlotHoverGroupClass, timeSlotBarClass } =
    getTimeSlotStyle(slot, room, {
      isMyReservation,
      isConflictReservation,
      isPastTime,
    });

  return (
    <li
      className={clsx(
        "flex w-48 flex-col justify-end md:w-75",
        isPastTime && !reservation?.id && "pointer-events-none",
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHeaderShow && (
        <TimeText
          isHalfHour={isHalfHour}
          isCurrentTimePeriod={isCurrentTimePeriod}
          time={time}
        />
      )}
      <div
        className="relative flex h-55 w-48 flex-col justify-end md:h-75 md:w-72"
        ref={ref}
      >
        {!is24Hour && (
          <>
            <div
              className={clsx(
                "absolute inset-0 left-1 z-timeline-slot -mx-1 md:w-72",
                pickedReservationClass.TIME_SLOT_GROUP,
                slot.isHovered
                  ? timeSlotHoverGroupClass
                  : "cursor-pointer hover:bg-gray-100-opacity-10 hover:shadow-[inset_0_0_0_1px_#413B541A]",
              )}
            >
              {(reservation?.id || isPicked) && (
                <ReservationBar className={timeSlotBarClass} />
              )}
            </div>
            {isMyReservation &&
              !isPastTime &&
              slot.reservation?.id &&
              slot.isLastInHoverGroup && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMutation.deleteRoomMutation();
                  }}
                  className="absolute -right-8 -top-8 z-timeline-slot-button"
                >
                  <XButton />
                </button>
              )}
            {slot.isFirstInHoverGroup &&
              slot.reservation?.id === hoveredReservationId &&
              reservation &&
              !isMyReservationNotExpired && (
                <span className="z-timeline-tooltip">
                  <Tooltip
                    title={reservation?.title}
                    participants={
                      reservation?.participants?.filter((p) => p.id !== null) ||
                      ([] as Member[])
                    }
                  />
                </span>
              )}
          </>
        )}
        <TimeVerticalLine
          isHalfHour={isHalfHour}
          isCurrentTimePeriod={isCurrentTimePeriod}
        />
        {!is24Hour && <BottomDottedBar />}
      </div>
    </li>
  );
}

export default forwardRef(ThirtyMinutesTimeBox);

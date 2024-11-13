import { isTimeInRange } from "@/lib/utils/timeUtils";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

import { TimeSlot } from "../components/TimeLine/TimeLineType";
import { pickedReservationAtom } from "../context";

function useGroupManager(timeSlots: TimeSlot[], groupType: "hover" | "picked") {
  const pickedReservation = useAtomValue(pickedReservationAtom);
  const [reservationId, setReservationId] = useState<string | undefined>(
    undefined,
  );
  const [groupFirstIndex, setGroupFirstIndex] = useState<number | null>(null);
  const [groupLastIndex, setGroupLastIndex] = useState<number | null>(null);

  const handleGroup = (id: string | undefined) => {
    setReservationId(id);
  };

  const handleGroupItem = (slot: TimeSlot, index: number) => {
    const isTyped = reservationId && slot.reservation?.id === reservationId;
    const isHovered = isTyped || false;
    const isPicked =
      isTyped ||
      (pickedReservation?.resourceId === slot.resource.id &&
        isTimeInRange(
          pickedReservation?.startTime || "",
          pickedReservation?.endTime || "",
          slot.time || "",
        )) ||
      false;
    const isFirstInHoverGroup = isHovered && index === groupFirstIndex;
    const isLastInHoverGroup = isHovered && index === groupLastIndex;
    const isFirstInPickedGroup = isPicked && index === groupFirstIndex;
    const isLastInPickedGroup = isPicked && index === groupLastIndex;

    return {
      isTyped,
      isHovered,
      isPicked,
      isFirstInHoverGroup,
      isLastInHoverGroup,
      isFirstInPickedGroup,
      isLastInPickedGroup,
    };
  };

  useEffect(() => {
    setReservationId(pickedReservation?.id);
  }, [pickedReservation]);

  useEffect(() => {
    if (!reservationId && !pickedReservation) {
      setGroupFirstIndex(null);
      setGroupLastIndex(null);
      return;
    }

    // 선택된 예약과 관련된 timeSlot만 선별
    const indices = timeSlots.reduce((acc: number[], slot, index) => {
      if (
        (reservationId && slot.reservation?.id === reservationId) ||
        (groupType === "picked" &&
          pickedReservation?.resourceId === slot.resource.id &&
          isTimeInRange(
            pickedReservation?.startTime || "",
            pickedReservation?.endTime || "",
            slot.time || "",
          ))
      ) {
        acc.push(index);
      }
      return acc;
    }, []);

    // console.log(groupType, reservationId, indices);

    if (indices.length > 0) {
      setGroupFirstIndex(indices[0]);
      setGroupLastIndex(indices[indices.length - 1]);
    } else {
      setGroupFirstIndex(null);
      setGroupLastIndex(null);
    }
  }, [reservationId, timeSlots]);

  return {
    reservationId,
    groupFirstIndex,
    groupLastIndex,
    handleGroup,
    handleGroupItem,
    groupType, // 그룹 타입을 반환해 필요할 때 조건문으로 구분 가능
  };
}

export default useGroupManager;

import clsx from "clsx";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";

import { pickedDateAtom } from "../../context";
import { TimeSlot } from "./TimeLineType";

type TimeVerticalLineProps = Pick<
  TimeSlot,
  "isHalfHour" | "isCurrentTimePeriod"
>;

export function TimeVerticalLine({
  isHalfHour,
  isCurrentTimePeriod,
}: TimeVerticalLineProps) {
  const pickedDate = useAtomValue(pickedDateAtom);
  const currentDay = dayjs().format("YYYY-MM-DD");
  const isToday = pickedDate === currentDay;

  return (
    <div
      className={clsx(
        `absolute z-timeline-vertical-line w-1`,
        isToday && isCurrentTimePeriod
          ? "h-full bg-black md:bottom-[-17px] md:h-147"
          : clsx(
              {
                "h-12 md:bottom-24 md:h-16": isHalfHour,
                "h-full md:bottom-[-17px] md:h-147": !isHalfHour,
              },
              "bg-gray-200",
            ),
      )}
    />
  );
}

export function BottomDottedBar() {
  return (
    <div className="relative bottom-6 w-full border-b border-dotted border-gray-15 md:bottom-32" />
  );
}

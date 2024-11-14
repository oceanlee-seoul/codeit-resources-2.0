import useIsMobile from "@/hooks/useIsMobile";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { targetRefAtom } from "@/store/scrollAtom";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";

import { pickedDateAtom, pickedReservationAtom } from "../context";
import TimeLine from "./TimeLine";

interface RoomSelectionProps {
  subType: string;
  roomList: Resource[];
  isFirstGroup?: boolean;
  reservations?: RoomReservation[];
}

function RoomSelection({
  subType,
  roomList,
  isFirstGroup = false,
  reservations = [],
}: RoomSelectionProps) {
  const [pickedReservation, setPickedReservation] = useAtom(
    pickedReservationAtom,
  );
  const pickedDate = useAtomValue(pickedDateAtom);

  const isOpenDrawer = useAtomValue(isOpenDrawerAtom);
  const isMobile = useIsMobile();

  const containerRefs = useRef<(HTMLUListElement | null)[]>([]);
  const targetRef = useAtomValue(targetRefAtom);

  const handleRoomClick = (room: Resource) => {
    setPickedReservation({
      ...pickedReservation,
      resourceName: room.name,
      resourceSubtype: room.resourceSubtype,
      resourceId: room.id,
    });
  };

  /**  ---- 모바일에서 각 타임라인 현재 시간으로 스크롤 이동  ---- */
  useEffect(() => {
    if (isMobile && targetRef?.current) {
      const targetPosition = targetRef.current.offsetLeft;

      containerRefs.current.forEach((containerRef) => {
        if (containerRef) {
          containerRef.scrollTo({
            left: targetPosition - 16,
            behavior: "smooth",
          });
        }
      });
    }
  }, [isMobile, targetRef, pickedDate]);

  return (
    <>
      <h3
        className={clsx(
          "text-14-500 text-gray-100-opacity-50 *:mb-16 md:mt-32",
        )}
      >
        <span className="md:absolute md:-translate-x-[152px] md:-translate-y-full">
          {subType}
        </span>
      </h3>
      <ul className="flex flex-col overflow-x-auto overflow-y-hidden pb-24 md:overflow-visible">
        {roomList.map((room, index) => {
          const isPickedRoom =
            pickedReservation?.resourceName === room.name && isOpenDrawer;
          return (
            <li
              key={room.name}
              className="group flex flex-col md:h-75 md:flex-row md:items-center"
              ref={(el) => {
                if (el) {
                  const timelineContainer = el.querySelector(
                    'div[class*="overflow-x-auto"]',
                  );
                  containerRefs.current[index] =
                    timelineContainer as HTMLUListElement;
                }
              }}
            >
              <button
                type="button"
                onClick={() => handleRoomClick(room)}
                className={clsx(
                  "flex h-48 w-max min-w-80 cursor-pointer items-center justify-center rounded-8 border-[1px] px-16 text-16-500 md:absolute md:h-59 md:min-w-128 md:-translate-x-[calc(24px+100%)]",
                  {
                    "bg-purple-80 text-gray-0": isPickedRoom,
                    "border-gray-100-opacity-10 text-gray-100-opacity-80":
                      !isPickedRoom,
                    "group-hover:bg-gray-80 group-hover:text-gray-0":
                      !isPickedRoom,
                  },
                )}
              >
                {room.name}
              </button>
              <TimeLine
                isHeaderShow={
                  isMobile || (!isMobile && isFirstGroup && index === 0)
                }
                room={room}
                reservations={reservations}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default RoomSelection;

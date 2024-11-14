import useIsMobile from "@/hooks/useIsMobile";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";

import { pickedReservationAtom } from "../context";
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

  const isOpenDrawer = useAtomValue(isOpenDrawerAtom);
  const isMobile = useIsMobile();

  const handleRoomClick = (room: Resource) => {
    setPickedReservation({
      ...pickedReservation,
      resourceName: room.name,
      resourceSubtype: room.resourceSubtype,
      resourceId: room.id,
    });
  };

  return (
    <>
      <h3
        className={clsx(
          "text-14-500 text-gray-100-opacity-50 *:mb-16 md:mt-32",
        )}
      >
        <span className="absolute md:absolute md:-translate-x-[152px] md:-translate-y-full">
          {subType}
        </span>
      </h3>
      <ul className="flex flex-col pb-24 pt-24 md:overflow-y-visible md:pt-0">
        {roomList.map((room: Resource, index) => {
          const isPickedRoom =
            pickedReservation?.resourceName === room.name && isOpenDrawer;
          return (
            <li
              key={room.name}
              className="group flex flex-col pt-24 md:h-75 md:flex-row md:items-center md:pt-0"
            >
              <button
                type="button"
                onClick={() => handleRoomClick(room)}
                className={clsx(
                  "absolute flex h-48 w-max min-w-80 -translate-y-1/2 cursor-pointer items-center justify-center rounded-8 border-[1px] px-16 text-16-500 md:absolute md:h-59 md:min-w-128 md:-translate-x-[calc(24px+100%)] md:translate-y-0",
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

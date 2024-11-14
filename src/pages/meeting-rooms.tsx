import Drawer from "@/components/commons/Drawer";
import ErrorBoundary from "@/components/commons/ErrorBoundary";
import useTabDrag from "@/components/commons/Tab/useTabDrag";
import Layout from "@/components/pages/meeting-rooms/Layout";
import {
  MeetingRoomsSkeleton,
  ReservationForm,
  RoomSelection,
} from "@/components/pages/meeting-rooms/components";
import {
  pickedDateAtom,
  pickedReservationAtom,
} from "@/components/pages/meeting-rooms/context";
import { useGetReservations } from "@/components/pages/meeting-rooms/hooks/useGetReservations";
import Error from "@/components/pages/seats/Error";
import { Resource } from "@/lib/api/amplify/helper";
import { getGroupedResourceListBySubtype } from "@/lib/api/amplify/resource/utils";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { containerRefAtom, targetRefAtom } from "@/store/scrollAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect, useMemo, useState } from "react";

function MeetingRoomsPage() {
  const { rooms, roomReservations, members } = useGetReservations();

  const pickedDate = useAtomValue(pickedDateAtom);
  const setPickedReservation = useSetAtom(pickedReservationAtom);

  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);

  // 리소스를 subtype별로 그룹화
  const groupedResources = useMemo(
    () => getGroupedResourceListBySubtype(rooms?.data as Resource[]),
    [rooms],
  );

  const handleDrawerClose = () => {
    setIsOpenDrawer(false);
    setPickedReservation(null);
  };

  /**  ---- 현재 시간으로 스크롤 이동  ---- */
  const containerRef = useAtomValue(containerRefAtom);
  const targetRef = useAtomValue(targetRefAtom);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);
  useEffect(() => {
    if (targetRef?.current && containerRef?.current) {
      const targetPosition = targetRef.current.offsetLeft;
      containerRef.current.scrollTo({
        left: targetPosition - 100,
        behavior: "smooth",
      });
      setTimeout(() => setIsInitialScrollDone(true), 300); // 초기 스크롤 완료 후 드래그 활성화
    }
  }, [targetRef, containerRef, pickedDate]);
  const { handleMouseDown, handleMouseMove, handleMouseUpOrLeave } =
    useTabDrag(containerRef);
  /**  ------------------------------- */

  return (
    <>
      <div>
        <Layout>
          <div className="z-[24] hidden h-full w-44 overflow-x-auto overflow-y-visible bg-gradient-to-r from-gray-5 from-50% to-gray-00-opacity-0 to-90% md:absolute md:block md:py-60" />
          {/* eslint-disable-next-line */}
          <div
            className="no-scrollbar overflow-x-auto overflow-y-visible md:py-60 md:pl-24"
            ref={containerRef}
            onMouseDown={isInitialScrollDone ? handleMouseDown : undefined}
            onMouseMove={isInitialScrollDone ? handleMouseMove : undefined}
            onMouseLeave={
              isInitialScrollDone ? handleMouseUpOrLeave : undefined
            }
            onMouseUp={isInitialScrollDone ? handleMouseUpOrLeave : undefined}
          >
            {Object.entries(groupedResources).map(
              ([subtype, roomList], index) => (
                <RoomSelection
                  key={subtype}
                  subType={subtype}
                  roomList={roomList}
                  isFirstGroup={index === 0}
                  reservations={roomReservations?.data}
                />
              ),
            )}
          </div>
        </Layout>
      </div>
      <Drawer onClose={handleDrawerClose}>
        <ReservationForm rooms={rooms?.data ?? []} members={members} />
      </Drawer>
    </>
  );
}

export default function MeetingRooms() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<MeetingRoomsSkeleton />}>
        <MeetingRoomsPage />
      </Suspense>
    </ErrorBoundary>
  );
}

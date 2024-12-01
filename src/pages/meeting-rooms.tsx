import ScrollContainer from "@/components/Layout/Scroll/ScrollContainer";
import Drawer from "@/components/commons/Drawer";
import ErrorBoundary from "@/components/commons/ErrorBoundary";
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
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { containerRefAtom, targetRefAtom } from "@/store/scrollAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect } from "react";

function MeetingRoomsPage() {
  const { rooms, roomReservations, members } = useGetReservations();

  const pickedDate = useAtomValue(pickedDateAtom);
  const setPickedReservation = useSetAtom(pickedReservationAtom);
  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);

  const handleDrawerClose = () => {
    setIsOpenDrawer(false);
    setPickedReservation(null);
  };

  /**  ---- 현재 시간으로 스크롤 이동  ---- */
  const containerRef = useAtomValue(containerRefAtom);
  const targetRef = useAtomValue(targetRefAtom);
  useEffect(() => {
    if (targetRef?.current && containerRef?.current) {
      const targetPosition = targetRef.current.offsetLeft;
      containerRef.current.scrollTo({
        left: targetPosition - 100,
        behavior: "smooth",
      });
    }
  }, [targetRef, containerRef, pickedDate]);
  /**  ------------------------------- */

  return (
    <>
      <div>
        <Layout>
          {/* gradient */}
          <div className="z-[24] -my-24 hidden h-full w-44 overflow-x-auto overflow-y-visible bg-gradient-to-r from-gray-5 from-50% to-gray-00-opacity-0 to-90% md:absolute md:block" />
          {/* -------- */}
          <ScrollContainer ref={containerRef}>
            <div className="overflow-y-visible md:py-60 md:pl-24">
              {Object.entries(rooms).map(([subtype, roomList], index) => (
                <RoomSelection
                  key={subtype}
                  subType={subtype}
                  roomList={roomList}
                  isFirstGroup={index === 0}
                  reservations={roomReservations?.data}
                />
              ))}
            </div>
          </ScrollContainer>
          {/* gradient */}
          <div className="z-[24] -my-24 hidden h-full w-44 overflow-x-auto overflow-y-visible bg-gradient-to-r from-transparent to-gray-5 to-50% md:absolute md:right-34 md:top-24 md:block" />
          {/* -------- */}
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

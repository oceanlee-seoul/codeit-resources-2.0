import { RoomReservation } from "@/lib/api/amplify/helper";
import { atom } from "jotai";

export type PickedReservationAtom = Partial<RoomReservation>;

const pickedReservationAtom = atom<PickedReservationAtom | null>({
  resourceSubtype: "",
  resourceName: "",
  startTime: "",
  endTime: "",
  // atom에 저장할 때는 Member 타입으로 저장
  participants: [],
});

export default pickedReservationAtom;

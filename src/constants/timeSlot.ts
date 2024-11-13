import {
  generateTimeSlots,
  getAvailableTimeSlots,
  getCurrentTime,
} from "@/lib/utils/timeUtils";

const ALL_TIME_SLOT_ITEMS: string[] = generateTimeSlots();

const TIME_SLOT_ITEMS = getAvailableTimeSlots(
  ALL_TIME_SLOT_ITEMS,
  getCurrentTime(),
);

export { ALL_TIME_SLOT_ITEMS, TIME_SLOT_ITEMS };

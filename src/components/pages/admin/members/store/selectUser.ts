import { User } from "@/lib/api/amplify/helper";
import { atom } from "jotai";

export const selectUserAtom = atom<User | null>(null);

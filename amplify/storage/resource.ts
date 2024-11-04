import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "codeitResourcesDrive",
  access: (allow) => ({
    "profile-images/*": [
      allow.groups(["ADMIN", "MEMBER"]).to(["read", "write", "delete"]),
    ],
  }),
});

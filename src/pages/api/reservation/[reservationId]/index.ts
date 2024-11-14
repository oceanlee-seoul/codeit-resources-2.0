import type { NextApiRequest, NextApiResponse } from "next";
import { JWT, getToken } from "next-auth/jwt";

import { updateReservation } from "../helper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { email, accessToken } = (await getToken({ req })) as JWT;

  if (!accessToken) {
    return res.status(401).json({ error: "Authorization token is required" });
  }
  if (!email) {
    return res.status(401).json({ error: "유저 정보가 필요합니다." });
  }
  try {
    switch (req.method) {
      case "PATCH":
        return await updateReservation(req, res);

      default:
        res.setHeader("Allow", ["PATCH", "DELETE"]);
        return res
          .status(405)
          .send({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

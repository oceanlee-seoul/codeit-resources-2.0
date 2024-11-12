import {
  CreateGoogleUserParams,
  createGoogleUser,
  getUserListByEmail,
  updateUserData,
} from "@/lib/api/amplify/user";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
  }

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email || !token?.name) {
      return res.status(400).json({ error: "사용자 정보를 찾을 수 없습니다." });
    }

    const resultList = await getUserListByEmail(token.email);

    // DynamoDB에 유저가 있음
    if (resultList.data && resultList.data.length) {
      const userData = resultList.data[0];
      // 아직 인증되지 않은 유저라면
      if (userData.isValid === false) {
        const updateParam = {
          id: userData.id,
          isValid: true,
        };
        const updateUser = await updateUserData(updateParam);
        if (!updateUser.data) {
          return res
            .status(500)
            .json({ error: "사용자 정보 업데이트에 실패했습니다." });
        }
        return res.status(200).json(updateUser.data);
      }
      return res.status(200).json(userData);
    }

    // DynamoDB에 유저가 없으면
    const param: CreateGoogleUserParams = {
      username: token.name,
      email: token.email,
      profileImage: token.picture || undefined,
      role: "MEMBER",
      teams: [],
      isValid: true,
    };

    const newUser = await createGoogleUser(param);
    if (!newUser.data) {
      return res.status(500).json({ error: "새 사용자 등록에 실패했습니다." });
    }
    return res.status(200).json(newUser.data);
  } catch (error) {
    console.error("사용자 처리 오류:", error);
    return res
      .status(500)
      .json({ error: "사용자 정보 처리 중 오류가 발생했습니다." });
  }
}

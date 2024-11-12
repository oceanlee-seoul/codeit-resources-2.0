import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

interface ProfilePhotoResponse {
  photoUrl?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfilePhotoResponse>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
  }

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return res.status(401).json({ error: "인증되지 않은 사용자입니다." });
    }

    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `프로필 사진을 가져오는데 실패했습니다: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.photos && data.photos[0]?.url) {
      return res.status(200).json({ photoUrl: data.photos[0].url });
    }

    return res.status(404).json({ error: "프로필 사진을 찾을 수 없습니다." });
  } catch (error) {
    console.error("프로필 사진 가져오기 실패:", error);
    return res
      .status(500)
      .json({ error: "프로필 사진을 가져오는 중 오류가 발생했습니다." });
  }
}

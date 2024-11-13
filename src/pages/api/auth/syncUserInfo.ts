import { User } from "@/lib/api/amplify/helper";
import {
  CreateUserParams,
  createUserData,
  getUserListByEmail,
  updateUserData,
} from "@/lib/api/amplify/user";
import type { NextApiRequest, NextApiResponse } from "next";
import { JWT, getToken } from "next-auth/jwt";

interface Token extends JWT {
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
}

// 토큰 검증
async function validateToken(req: NextApiRequest): Promise<Token> {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as Token;

  if (!token?.email || !token?.name) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }

  return token;
}

// 기존 유저 처리
async function handleExistingUser(userData: User, token: Token) {
  // 이미 유효한 유저 처리
  if (userData.isValid) {
    // 프로필 이미지 업데이트 필요 여부 확인
    if (userData.profileImage !== token.picture && token.picture) {
      const updateResult = await updateUserData({
        id: userData.id,
        profileImage: token.picture,
      });
      return { data: updateResult.data };
    }
    return { data: userData };
  }

  // 미인증 유저 처리
  const updateResult = await updateUserData({
    id: userData.id,
    isValid: true,
    profileImage: token.picture || undefined,
  });

  if (!updateResult.data) {
    throw new Error("사용자 정보 업데이트에 실패했습니다.");
  }

  return { data: updateResult.data };
}

// 신규 유저 생성
async function createNewUser(token: Token) {
  const newUserParams: CreateUserParams = {
    username: token.name,
    email: token.email,
    profileImage: token.picture || undefined,
    role: "MEMBER",
    teams: [],
    isValid: true,
  };

  const newUser = await createUserData(newUserParams);
  if (!newUser.data) {
    throw new Error("신규 유저를 생성하지 못했습니다.");
  }

  return { data: newUser.data };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
  }

  try {
    // 토큰 검증
    const token = await validateToken(req);

    // 기존 유저 조회
    const userList = await getUserListByEmail(token.email);

    // 기존 유저가 있는 경우
    if (userList.data?.length) {
      const result = await handleExistingUser(userList.data[0], token);
      return res.status(200).json(result);
    }

    // 신규 유저 생성
    const result = await createNewUser(token);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "사용자 정보 처리 중 오류가 발생했습니다." });
  }
}

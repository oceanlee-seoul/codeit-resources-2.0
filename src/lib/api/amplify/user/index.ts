import { OrderType } from "@/constants/dropdownConstants";

import { axiosInstance } from "../../helper";
import { Role, User, client } from "../helper";

/**
 * @description [특정 유저 정보 가져오기]
 *
 * 해당 id값을 가진 유저 정보 가져오기
 * 내 정보, 다른 사람 정보 다 가져올 수 있음
 */
export const getUserData = async (id: string) => client.models.User.get({ id });

type SelectionSet = Array<
  "id" | "username" | "email" | "role" | "teams" | "profileImage"
>;

/**
 * @description [전체 유저 정보 가져오기]
 *
 * 유저 List 정보 가져오기
 * 인자에 값을 넣어주는 것으로 필요한 필드 값만 가져올 수 있음
 */
export const getUserList = async (selectionSet?: SelectionSet) => {
  if (!selectionSet) return client.models.User.list();

  return client.models.User.list({
    selectionSet: [...selectionSet],
  });
};

export type UpdateUserParams = {
  id: string; // 업데이트할 유저 ID
  role?: Role;
  username?: string;
  email?: string;
  profileImage?: string;
  teams?: string[];
  isValid?: boolean;
};
/**
 * @description [유저 정보 수정하기]
 *
 * id는 필수
 * role, username, email, profileImage는 선택
 */
export const updateUserData = async (param: UpdateUserParams) =>
  client.models.User.update(param);

/**
 * @description [유저 삭제하기]
 */
export const deleteUserData = async (id: string) =>
  client.models.User.delete({ id });

/**
 * @description [유저 목록 가져오기]
 *
 * [category]
 * 0: 전체
 * 1: 멤버
 * 2: 어드민
 * 그 외: 소속 팀
 *
 * [order]
 * latest 최신순
 * oldest 오래된순
 * alphabetical 가나다순
 */
export const getUserListData = async (
  category: string,
  order: OrderType,
): Promise<User[]> => {
  try {
    const response = await axiosInstance(
      `/users?category=${category}&order=${order}`,
    );
    return response.data;
  } catch (error) {
    throw new Error("데이터를 가져오지 못했습니다.");
  }
};

/**
 * 해당 이메일을 가진 유저 가져오기
 */
export const getUserListByEmail = async (email: string) =>
  client.models.User.list({
    filter: { email: { eq: email } },
  });

/**
 * 유저 생성하기
 */
export type CreateUserParams = {
  username: string; // 유저 이름
  email: string; // 유저 이메일
  role: Role; // 유저 역할 ADMIN | MEMBER
  teams: string[]; // 소속 팀
  profileImage?: string; // 유저 프로필 이미지
  isValid: boolean;
};
/**
 * @description [유저 생성하기]
 *
 * id, username, email, role, teams 모두 입력받아야 합니다.
 */
export const createUserData = async (param: CreateUserParams) => {
  const userData = await getUserListByEmail(param.email);
  if (userData.data.length) {
    throw new Error("이미 존재하는 이메일입니다.");
  }
  return client.models.User.create(param);
};

/**
 * 유저 수정하기
 */
export const updateUserByAdmin = async (param: UpdateUserParams) => {
  if (param.email) {
    const userData = await getUserListByEmail(param.email);
    if (userData.data.length) {
      throw new Error("이미 존재하는 이메일입니다.");
    }
  }
  return client.models.User.update(param);
};

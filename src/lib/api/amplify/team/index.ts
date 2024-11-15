import { Team, client } from "../helper";

/**
 * @description [팀 이름 중복 확인]
 */
export const isTeamNameExists = async (name: string) => {
  const result = await client.models.Team.list({
    filter: { name: { eq: name } },
  });
  return result.data.length > 0;
};

/**
 * @description [팀 생성하기]
 *
 * name 값만 입력 받습니다.
 */
export const createTeamData = async (name: string) => {
  if (await isTeamNameExists(name))
    throw new Error("이미 존재하는 팀 이름 입니다.");
  return client.models.Team.create({ name });
};

/**
 * @description [팀 목록 가져오기]
 *
 * 최근 데이터가 상위에
 */
export const getTeamListData = async () => {
  const teamList = await client.models.Team.list();
  return teamList.data.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

/**
 * @description 팀 삭제하면서, 해당 팀에 소속된 유저의 teams 배열 업데이트
 *
 * @param teamId 삭제할 팀id
 */
export const deleteTeamAndUpdateUsers = async (
  teamId: string,
): Promise<Team> => {
  const response = await fetch(`/api/team?teamId=${teamId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("팀을 삭제하지 못했습니다.");
  }

  return data;
};

/**
 * @description [팀 이름 수정하기]
 */
export const updateTeamName = async (id: string, name: string) => {
  if (await isTeamNameExists(name))
    throw new Error("이미 존재하는 팀 이름 입니다.");
  return client.models.Team.update({ id, name });
};

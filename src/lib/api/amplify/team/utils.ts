import { getTeamListData } from ".";
import { getUserListData } from "../user";

export async function getTeamMap() {
  const teams = await getTeamListData();

  return teams.reduce(
    (acc, team) => {
      acc[team.id] = team.name;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export async function getMemberList() {
  const teamMap = await getTeamMap();
  const users = await getUserListData("0", "alphabetical");

  return users.map((user) => ({
    id: user.id,
    name: user.username,
    teams: (user.teams || [])
      .filter((teamId): teamId is string => teamId !== null)
      .map((teamId) => teamMap[teamId] || ""),
    profileImage: user.profileImage || "",
    email: user.email,
  }));
}

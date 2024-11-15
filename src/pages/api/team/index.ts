import { client } from "@/lib/api/amplify/helper";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "허용되지 않은 메서드입니다." });
  }

  try {
    const { teamId } = req.query as { teamId: string };

    if (!teamId) {
      return res.status(400).json({ message: "팀 ID가 필요합니다." });
    }

    // 1. User 모델에서 teams 배열에 teamId가 포함된 모든 사용자 가져오기
    const usersWithTeam = await client.models.User.list({
      filter: { teams: { contains: teamId } },
    });

    // 2. 각 사용자의 teams 배열에서 teamId를 제거하고 업데이트
    const updatePromises = usersWithTeam.data.map(async (user) => {
      const updatedTeams = user.teams
        ? user.teams.filter((id): id is string => id !== teamId && id !== null)
        : [];

      if (updatedTeams.length !== user.teams?.length) {
        return client.models.User.update({
          id: user.id,
          teams: updatedTeams,
        });
      }
      return Promise.resolve();
    });

    // 모든 업데이트 작업이 완료될 때까지 대기
    await Promise.all(updatePromises);

    // 3. 팀 삭제 수행
    const result = await client.models.Team.delete({ id: teamId });

    if (result.data) {
      return res.status(200).json(result.data);
    }
    return res.status(404).json({ message: "팀을 찾을 수 없습니다." });
  } catch {
    return res.status(500).json({ message: "팀 삭제 중 오류가 발생했습니다." });
  }
}

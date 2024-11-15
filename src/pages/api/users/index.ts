import { User, client } from "@/lib/api/amplify/helper";
import { NextApiRequest, NextApiResponse } from "next";

type OrderType = "latest" | "oldest" | "alphabetical";

const sortUserList = (userList: User[], order: OrderType) => {
  switch (order) {
    case "latest":
      return userList.sort(
        (a, b) =>
          (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
          (a.createdAt ? new Date(a.createdAt).getTime() : 0),
      );
    case "oldest":
      return userList.sort(
        (a, b) =>
          (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
          (b.createdAt ? new Date(b.createdAt).getTime() : 0),
      );
    case "alphabetical":
      return userList.sort((a, b) => a.username.localeCompare(b.username));
    default:
      return userList;
  }
};

async function fetchUsersByRole(role: "ADMIN" | "MEMBER", order: OrderType) {
  switch (order) {
    case "latest":
      return (
        await client.models.User.listUsersByRoleDate(
          { role },
          { sortDirection: "DESC" },
        )
      ).data;
    case "oldest":
      return (
        await client.models.User.listUsersByRoleDate(
          { role },
          { sortDirection: "ASC" },
        )
      ).data;
    case "alphabetical":
      return (
        await client.models.User.listUsersByRoleName(
          { role },
          { sortDirection: "ASC" },
        )
      ).data;
    default:
      return (await client.models.User.listUsersByRoleDate({ role })).data;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "허용되지 않은 메서드입니다." });
  }

  try {
    const { category, order } = req.query as {
      category: string;
      order: OrderType;
    };

    let users;
    let userList;
    let userListByTeam;

    switch (category) {
      case "0":
        userList = (await client.models.User.list()).data;
        users = sortUserList(userList, order);
        break;
      case "1":
        users = await fetchUsersByRole("MEMBER", order);
        break;
      case "2":
        users = await fetchUsersByRole("ADMIN", order);
        break;
      default:
        userListByTeam = (
          await client.models.User.list({
            filter: { teams: { contains: category } },
          })
        ).data;
        users = sortUserList(userListByTeam, order);
    }

    return res.status(200).json(users);
  } catch {
    return res.status(500).json({ message: "데이터를 가져오지 못했습니다." });
  }
}

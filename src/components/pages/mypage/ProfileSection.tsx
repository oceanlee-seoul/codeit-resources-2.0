import Badge from "@/components/commons/Badge";
import ProfileImage from "@/components/commons/ProfileImage";
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { client } from "@/lib/api/amplify/helper";
import { getTeamListData } from "@/lib/api/amplify/team";
import { userAtom } from "@/store/authUserAtom";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import LogOutButton from "./LogOutButton";
import ProfileSectionSkeleton from "./ProfileSectionSkeleton";

export default function ProfileSection() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);

  const fetchUser = async () => {
    if (!user?.id) return null;
    const userResponse = await client.models.User.get({ id: user.id });
    return userResponse?.data || null;
  };

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: [QUERY_KEY.USER, user?.id],
    queryFn: fetchUser,
    enabled: Boolean(user),
  });

  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: [QUERY_KEY.TEAM_LIST],
    queryFn: () => getTeamListData(),
    staleTime: DEFAULT_STALE_TIME,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);

  const myTeamList = userData?.teams
    ?.map((teamId) => teamData?.find((teamItem) => teamItem.id === teamId))
    .filter(Boolean);

  if (isUserLoading || isTeamLoading) {
    return <ProfileSectionSkeleton />;
  }

  return (
    <section>
      <div className="flex items-end gap-12">
        <h2 className="text-24-700 text-gray-100">내 프로필</h2>
        <span className="text-14-500 text-gray-70">
          내 정보를 확인하세요 :)
        </span>
      </div>
      <hr className="my-16" />
      <div className="w-full rounded-10 border-2 shadow-sm md:max-w-500">
        <div className="relative h-120 rounded-t-10 bg-gradient-to-r from-purple-30 to-purple-10">
          <div className="absolute -bottom-60 left-1/2 size-120 -translate-x-1/2 rounded-full border-4 border-white shadow-md">
            <ProfileImage
              size="xl"
              imagePath={user?.profileImage || undefined}
            />
          </div>
          {userData?.role === "ADMIN" && (
            <div className="absolute right-15 top-15">
              <Badge variant="primary">
                <div className="flex gap-4 px-5 py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{userData?.role}</span>
                </div>
              </Badge>
            </div>
          )}
        </div>
        <div className="mt-80 flex flex-col items-center justify-center">
          <span className="text-20-700">{user?.username}</span>
          <span className="text-14-500 text-gray-80">{user?.email}</span>
          <div className="mt-12 flex gap-3">
            {myTeamList && myTeamList.length > 0 ? (
              myTeamList.map((team) => (
                <Badge key={team?.id} variant="secondarySmall">
                  {team?.name}
                </Badge>
              ))
            ) : (
              <span className="text-gray-100-opacity-70">
                소속된 팀이 없습니다
              </span>
            )}
          </div>
        </div>
        <LogOutButton />
      </div>
    </section>
  );
}

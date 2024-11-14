import Badge from "@/components/commons/Badge";
import ProfileImage from "@/components/commons/ProfileImage";
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import useIsMobile from "@/hooks/useIsMobile";
import { client } from "@/lib/api/amplify/helper";
import { getTeamListData } from "@/lib/api/amplify/team";
import { userAtom } from "@/store/authUserAtom";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import MobileProfileSectionSkeleton from "./MobileProfileSectionSkeleton";
import ProfileSectionSkeleton from "./ProfileSectionSkeleton";

export default function ProfileSection() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const isMobile = useIsMobile();

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

  if (isUserLoading && isTeamLoading) {
    if (isMobile) {
      return <MobileProfileSectionSkeleton />;
    }
    return <ProfileSectionSkeleton />;
  }

  const myTeamList = userData?.teams
    ?.map((teamId) => teamData?.find((teamItem) => teamItem.id === teamId))
    .filter(Boolean);

  return (
    <section>
      <h2 className="text-24-700 text-gray-100">
        {isMobile ? "설정" : "내 프로필"}
      </h2>
      <hr className="mt-10 hidden md:block" />
      <div className="mt-20 flex flex-col gap-10">
        {isMobile ? (
          <>
            <div className="flex items-center gap-10">
              {userData && (
                <ProfileImage
                  size="lg"
                  imagePath={user?.profileImage ?? undefined}
                />
              )}
            </div>
            <div className="flex flex-col gap-5 rounded-8 border bg-gray-10 px-16 py-12">
              <div className="flex items-center">
                <span className="inline-block w-50 text-14-700 text-gray-100-opacity-60">
                  이름
                </span>
                <span className="ml-30 mr-5 inline-block text-16-400 text-gray-100">
                  {userData?.username || ""}
                </span>
                {userData?.role === "ADMIN" ? (
                  <Badge variant="primary">{userData?.role}</Badge>
                ) : null}
              </div>
              <div className="flex items-center">
                <span className="inline-block w-50 text-14-700 text-gray-100-opacity-60">
                  이메일
                </span>
                <span className="ml-30 inline-block text-16-400 text-gray-100">
                  {userData?.email || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-50 text-14-700 text-gray-100-opacity-60">
                  팀
                </span>
                <span className="ml-30 inline-block text-16-400 text-gray-100">
                  <div className="flex gap-3">
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
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <span className="inline-block w-50 text-17-700 text-gray-100">
                이름
              </span>
              <span className="ml-30 mr-5 inline-block text-16-400 text-gray-100">
                {userData?.username || ""}
              </span>
              {userData?.role === "ADMIN" ? (
                <Badge variant="primary">{userData?.role}</Badge>
              ) : null}
            </div>
            <div className="flex items-center">
              <span className="inline-block w-50 text-17-700 text-gray-100">
                이메일
              </span>
              <span className="ml-30 inline-block text-16-400 text-gray-100">
                {userData?.email || ""}
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-50 text-17-700 text-gray-100">
                팀
              </span>
              <span className="ml-30 inline-block text-16-400 text-gray-100">
                <div className="flex gap-3">
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
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-50 text-17-700 text-gray-100">
                사진
              </span>
              <div className="ml-30 flex items-center gap-10">
                {userData && (
                  <ProfileImage
                    size="lg"
                    imagePath={user?.profileImage ?? undefined}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

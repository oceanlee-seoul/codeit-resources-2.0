import Button from "@/components/commons/Button";
import TeamsSelectDropdown from "@/components/commons/Dropdown/MultiSelectDropdown/TeamsSelectDropdown";
import ProfileImage from "@/components/commons/ProfileImage";
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import useToast from "@/hooks/useToast";
import { Team } from "@/lib/api/amplify/helper";
import { getTeamListData } from "@/lib/api/amplify/team";
import { CreateUserParams, createUserData } from "@/lib/api/amplify/user";
import { adminAtom, userAtom } from "@/store/authUserAtom";
import LoadingSpinner from "@public/gifs/loading-spinner.svg";
import CodeitTextLogo from "@public/images/codeit-resources.svg";
import CodeitLogo from "@public/images/codeit.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

function OnBoarding() {
  const { data } = useSession();
  const router = useRouter();
  const { success, error } = useToast();

  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const setUser = useSetAtom(userAtom);
  const setIsAdmin = useSetAtom(adminAtom);

  const { data: teamList } = useQuery<Team[]>({
    queryKey: [QUERY_KEY.TEAM_LIST],
    queryFn: () => getTeamListData(),
    staleTime: DEFAULT_STALE_TIME,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (param: CreateUserParams) => createUserData(param),
    onSuccess: (res) => {
      success("계정이 생성되었습니다.");
      setUser(res.data);
      setIsAdmin(false);
      router.push("/");
    },
    onError: () => {
      error("계정을 생성하지 못했습니다.");
    },
  });

  if (!data?.user?.name || !data?.user?.email) {
    router.push("/sign-in");
    return null;
  }

  const handleSelect = (team: Team) => {
    setSelectedTeams((prev) => [...prev, team]);
  };

  const handleRemove = (team: Team) => {
    setSelectedTeams((prev) => prev.filter((t) => t !== team));
  };

  // 새로운 유저 생성
  const handleCreateNewUser = async () => {
    const newUserParams: CreateUserParams = {
      username: data?.user?.name || "",
      email: data?.user?.email || "",
      profileImage: data?.user?.image || undefined,
      role: "MEMBER",
      teams: selectedTeams.map((t) => t.id),
      isValid: true,
    };

    mutate(newUserParams);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mb-60 flex flex-col items-center justify-center gap-30 px-8 md:mb-100">
        <div className="hidden items-center gap-8 md:flex">
          <CodeitLogo />
          <CodeitTextLogo />
        </div>

        <ProfileImage imagePath={data?.user?.image || undefined} size="xl" />
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-24-700">
            <span className="text-purple-60">{data?.user?.name}</span>님
            환영합니다 👋
          </h1>
          <span className="text-14-500 text-gray-90">{data?.user?.email}</span>
        </div>

        <div className="flex w-300 flex-col gap-16 py-20">
          <p className="text-center text-18-700">
            현재 소속된 부서를 선택해주세요
          </p>
          {teamList && (
            <TeamsSelectDropdown
              selectedTeams={selectedTeams}
              onSelect={handleSelect}
              onRemove={handleRemove}
              departmentList={teamList}
            />
          )}
        </div>

        <Button
          onClick={handleCreateNewUser}
          disabled={!selectedTeams.length || isPending}
          width="w-300"
        >
          {isPending ? <LoadingSpinner height={27} width="100%" /> : "시작하기"}
        </Button>
      </div>
    </div>
  );
}

export default OnBoarding;

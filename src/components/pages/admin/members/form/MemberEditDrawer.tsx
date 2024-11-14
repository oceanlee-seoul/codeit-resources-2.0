import Button from "@/components/commons/Button";
import QUERY_KEY from "@/constants/queryKey";
import useModal from "@/hooks/useModal";
import useToast from "@/hooks/useToast";
import { Team, User } from "@/lib/api/amplify/helper";
import { UpdateUserParams, updateUserByAdmin } from "@/lib/api/amplify/user";
import { TeamInput, memberSchema } from "@/lib/zod-schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import MemberForm from "./MemberForm";

interface MemberEditDrawerProps {
  userData: User;
  setOpenKey: (value: string | null) => void;
  teamList: Team[];
}

function MemberEditDrawer({
  userData,
  setOpenKey,
  teamList,
}: MemberEditDrawerProps) {
  const { success, error } = useToast();
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  const [selectedTeams, setSelectedTeams] = useState<Team[]>(
    userData.teams
      ? teamList.filter((team) => userData.teams!.includes(team.id))
      : [],
  );

  const methods = useForm<TeamInput>({
    resolver: zodResolver(memberSchema),
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: {
      role: userData?.role ?? "MEMBER",
      username: userData?.username,
      email: userData?.email,
      teams: [],
      image: userData.profileImage,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateUserParams) => updateUserByAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USER_LIST] });
      success(`${userData.username} 님을 수정했습니다.`);
    },
    onError: (err) => {
      error(err.message || `${userData.username} 님을 수정하지 못했습니다.`);
    },
    onSettled: () => {
      setOpenKey(null);
    },
  });

  const onSubmit: SubmitHandler<TeamInput> = async (data) => {
    const selectedTeamIds = selectedTeams.map((team) => team.id);

    const formData: UpdateUserParams = {
      id: userData.id,
    };

    if (data.role !== userData.role) formData.role = data.role;
    if (data.username !== userData.username) formData.username = data.username;
    if (data.email !== userData.email) formData.email = data.email;
    if (JSON.stringify(selectedTeamIds) !== JSON.stringify(userData.teams))
      formData.teams = selectedTeamIds;

    mutate(formData);
  };

  return (
    <div className="mt-32 flex w-full flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-24-700">멤버 수정</h2>
        <Button
          onClick={() => {
            openModal("deleteMemberModal", {
              userData,
              setOpenKey,
            });
          }}
          width="w-88"
          height="h-32"
          size="small"
          variant="secondary"
        >
          탈퇴하기
        </Button>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <MemberForm
            teamList={teamList}
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
            isLoading={isPending}
            isValidUser={userData.isValid || false}
            mode="edit"
          />
        </form>
      </FormProvider>
    </div>
  );
}

export default MemberEditDrawer;

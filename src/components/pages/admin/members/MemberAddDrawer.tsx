import QUERY_KEY from "@/constants/queryKey";
import useToast from "@/hooks/useToast";
import { Team } from "@/lib/api/amplify/helper";
import { CreateUserParams, createUserData } from "@/lib/api/amplify/user";
import { TeamInput, memberSchema } from "@/lib/zod-schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import MemberForm from "./MemberForm";

interface MemberAddDrawerProps {
  setOpenKey: (value: string | null) => void;
  teamList: Team[];
}

function MemberAddDrawer({ setOpenKey, teamList }: MemberAddDrawerProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const methods = useForm<TeamInput>({
    resolver: zodResolver(memberSchema),
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: {
      role: "MEMBER",
      username: "",
      email: "",
      teams: [],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateUserParams) => createUserData(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USER_LIST] });
      success(`${variables.username} 님을 추가했습니다.`);
    },
    onError: (err, variables) => {
      error(err.message || `${variables.username} 님을 추가하지 못했습니다.`);
    },
    onSettled: () => {
      setOpenKey(null);
    },
  });

  const onSubmit: SubmitHandler<TeamInput> = async (data) => {
    const formData: CreateUserParams = {
      ...data,
      teams: selectedTeams.map((t) => t.id),
      isValid: false,
    };

    mutate(formData);
  };

  return (
    <div className="mt-32 flex w-full flex-col">
      <h2 className="text-24-700">멤버 추가</h2>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <MemberForm
            teamList={teamList}
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
            isLoading={isPending}
            mode="add"
          />
        </form>
      </FormProvider>
    </div>
  );
}

export default MemberAddDrawer;

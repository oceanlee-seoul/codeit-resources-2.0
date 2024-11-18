import Button from "@/components/commons/Button";
import MemberList from "@/components/pages/admin/members/MemberList";
import MemberTap from "@/components/pages/admin/members/MemberTap";
import { selectUserAtom } from "@/components/pages/admin/members/store/selectUser";
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { Team } from "@/lib/api/amplify/helper";
import { getTeamListData } from "@/lib/api/amplify/team";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

function AdminMemberPage() {
  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);
  const setSelectUser = useSetAtom(selectUserAtom);

  const { data, isLoading } = useQuery<Team[]>({
    queryKey: [QUERY_KEY.TEAM_LIST],
    queryFn: () => getTeamListData(),
    staleTime: DEFAULT_STALE_TIME,
  });

  return (
    <div className="h-full min-h-screen bg-gray-5 px-25 pt-64 md:px-88 md:pt-80 lg:px-118">
      <div className="flex items-center justify-between">
        <h1 className="text-24-700 text-gray-100 md:text-28-700">멤버 관리</h1>
        <Button
          onClick={() => {
            setIsOpenDrawer(true);
            setSelectUser(null);
          }}
          variant="secondary"
          width="w-125"
          height="h-42"
        >
          + 멤버 추가
        </Button>
      </div>
      <div className="mt-34">
        <MemberTap tapData={data ?? []} isLoading={isLoading} />
        <MemberList teamList={data ?? []} />
      </div>
    </div>
  );
}

export default AdminMemberPage;

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import Drawer from "@/components/commons/Drawer";
import { OrderType } from "@/constants/dropdownConstants";
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { Team } from "@/lib/api/amplify/helper";
import { getUserListData } from "@/lib/api/amplify/user";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import ChevronRight from "@public/icons/icon-chevron-right.svg";
import IconAlert from "@public/icons/icon-modal-alert.svg";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo } from "react";

import MemberCard from "./MemberCard";
import MemberSkeleton from "./MemberSkeleton";
import MemberAddDrawer from "./form/MemberAddDrawer";
import MemberEditDrawer from "./form/MemberEditDrawer";
import { selectUserAtom } from "./store/selectUser";

interface MemberListProps {
  teamList: Team[];
}

function MemberList({ teamList }: MemberListProps) {
  const router = useRouter();
  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);
  const [selectUser, setSelectUser] = useAtom(selectUserAtom);
  const { query } = router;

  // URL 파라미터에서 카테고리 id와 order 값을 가져오기
  const categoryId = (query.category as string) || "0";
  const orderBy = (query.order as OrderType) || "latest";

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY.USER_LIST, categoryId, orderBy],
    queryFn: () => getUserListData(categoryId, orderBy),
    staleTime: DEFAULT_STALE_TIME,
  });

  const teamMap = useMemo(
    () =>
      teamList.reduce(
        (acc, team) => {
          acc[team.id] = team.name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [teamList],
  );

  useEffect(() => {
    setIsOpenDrawer(false);
  }, [categoryId, orderBy]);

  if (isLoading) {
    return <MemberSkeleton />;
  }

  if (error) {
    return (
      <div className="mt-40 flex flex-col gap-16">
        <div className="flex h-172 flex-col items-center justify-center gap-8 rounded-12 border bg-gray-15 text-18-400">
          <IconAlert />
          <span>데이터를 불러오지 못했습니다.</span>
          <span>다시 시도하거나 관리자에게 문의하세요.</span>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="mt-24 flex max-h-screen-350 flex-col gap-16 overflow-x-auto md:max-h-screen-300">
        {data.length ? (
          <>
            {data.map((item) => (
              <Fragment key={item.id}>
                <div
                  role="button"
                  onClick={() => {
                    setSelectUser(item);
                    setIsOpenDrawer(true);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-12 border bg-gray-0 px-16 py-10 duration-300 hover:bg-gray-10 md:px-22 md:py-12"
                >
                  <MemberCard user={item} teamMap={teamMap} />
                  <div className="hidden md:flex">
                    <ChevronRight />
                  </div>
                </div>
              </Fragment>
            ))}
          </>
        ) : (
          <div className="flex h-172 flex-col items-center justify-center gap-8 rounded-12 border bg-gray-15 text-16-400 text-gray-100">
            <span>해당 조건에 알맞은 멤버가 없습니다.</span>
            <span>
              상단에 있는 &quot;멤버 추가&quot; 버튼을 눌러 멤버를 생성해주세요!
            </span>
          </div>
        )}
        <Drawer
          onClose={() => {
            setIsOpenDrawer(false);
            setSelectUser(null);
          }}
        >
          {selectUser ? (
            <MemberEditDrawer
              key={selectUser.id}
              userData={selectUser}
              teamList={teamList}
            />
          ) : (
            <MemberAddDrawer key="addMember" teamList={teamList} />
          )}
        </Drawer>
      </div>
    );
  }
}

export default MemberList;

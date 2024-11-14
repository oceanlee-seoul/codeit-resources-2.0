/* eslint-disable @typescript-eslint/no-unused-vars, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
import Drawer from "@/components/commons/Drawer";
import { OrderType } from "@/constants/dropdownConstants";
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { Team } from "@/lib/api/amplify/helper";
import { getUserListData } from "@/lib/api/amplify/user";
import ChevronRight from "@public/icons/icon-chevron-right.svg";
import IconAlert from "@public/icons/icon-modal-alert.svg";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo } from "react";

import MemberCard from "./MemberCard";
import MemberSkeleton from "./MemberSkeleton";
import MemberEditDrawer from "./form/MemberEditDrawer";

interface MemberListProps {
  openKey: string | null;
  setOpenKey: (value: string | null) => void;
  teamList: Team[];
}

function MemberList({ openKey, setOpenKey, teamList }: MemberListProps) {
  const router = useRouter();
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
    setOpenKey(null);
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
                  onClick={() => setOpenKey(item.id)}
                  className="flex cursor-pointer items-center justify-between rounded-12 border bg-gray-0 px-16 py-10 duration-300 hover:bg-gray-10 md:px-22 md:py-12"
                >
                  <MemberCard user={item} teamMap={teamMap} />
                  <div className="hidden md:flex">
                    <ChevronRight />
                  </div>
                </div>
                <AnimatePresence>
                  {openKey === item.id && (
                    <Drawer onClose={() => setOpenKey(null)}>
                      <MemberEditDrawer
                        userData={item}
                        setOpenKey={setOpenKey}
                        teamList={teamList}
                      />
                    </Drawer>
                  )}
                </AnimatePresence>
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
      </div>
    );
  }
}

export default MemberList;

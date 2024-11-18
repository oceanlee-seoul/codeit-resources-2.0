import ChevronRight from "@public/icons/icon-chevron-right.svg";
import Link from "next/link";
import React from "react";

function SettingLinkItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      className="flex w-full items-center justify-between border-b px-8 py-16 text-16-500 text-gray-100"
      aria-label={`${children} 페이지로 이동`}
    >
      <span>{children}</span>
      <ChevronRight />
    </Link>
  );
}

export default function SettingsLinksSection() {
  return (
    <section className="mb-100 flex flex-col md:mb-0 md:hidden">
      <div className="flex items-end gap-12">
        <h2 className="text-24-700 text-gray-100">어드민 기능</h2>
        <span className="text-14-500 text-gray-70">
          리소스들을 관리할 수 있어요
        </span>
      </div>
      <hr className="my-16" />
      <SettingLinkItem to="/admin/members">멤버 관리</SettingLinkItem>
      <SettingLinkItem to="/admin/teams">팀 관리</SettingLinkItem>
      <SettingLinkItem to="/admin/meeting-rooms">회의실 설정</SettingLinkItem>
      <SettingLinkItem to="/admin/seats">좌석 설정</SettingLinkItem>
    </section>
  );
}

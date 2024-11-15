import ProfileSection from "@/components/pages/mypage/ProfileSection";
import SettingsLinksSection from "@/components/pages/mypage/SettingsLinks";
import { adminAtom } from "@/store/authUserAtom";
import { useAtomValue } from "jotai";

export default function MyPage() {
  const isAdmin = useAtomValue(adminAtom);

  return (
    <main className="mb-120 flex flex-col gap-50 px-16 pt-64 md:px-80">
      <ProfileSection />
      {isAdmin ? <SettingsLinksSection /> : null}
    </main>
  );
}

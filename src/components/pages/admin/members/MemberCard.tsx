import Badge from "@/components/commons/Badge";
import ProfileImage from "@/components/commons/ProfileImage";
import { User } from "@/lib/api/amplify/helper";

interface MemberCardProps {
  user: User;
  teamMap: Record<string, string>;
}

type Nullable<T> = T | null;

interface TeamBadgesProps {
  teams: Nullable<string>[] | null | undefined;
  teamMap: Record<string, string>;
}

function TeamBadges({ teams, teamMap }: TeamBadgesProps) {
  return (
    <div className="flex items-center gap-4">
      {teams?.map((teamId: string | null) =>
        teamId ? (
          <Badge key={teamId} variant="secondarySmallSquare">
            {teamMap[teamId] || "알 수 없는 팀"}
          </Badge>
        ) : (
          <span key="no-team">소속된 팀이 없습니다.</span>
        ),
      )}
    </div>
  );
}

function MemberCard({ user, teamMap }: MemberCardProps) {
  return (
    <div className="flex items-center gap-12 md:gap-16">
      <div className="relative flex-shrink-0">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            user.isValid ? "bg-green-500" : "bg-orange-500"
          }`}
        />
        <div
          className={`absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-75 ${
            user.isValid ? "bg-green-500" : "bg-orange-500"
          }`}
          style={{ animationDuration: "2s" }}
        />
      </div>
      <div className="hidden md:flex">
        <ProfileImage imagePath={user.profileImage ?? undefined} size="md" />
      </div>
      <div className="md:hidden">
        <ProfileImage imagePath={user.profileImage ?? undefined} size="sm" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
        {/* sm, md */}
        <div className="flex flex-col lg:hidden">
          <div className="flex gap-8">
            <span className="text-14-700 text-gray-100 md:text-15-700">
              {user.username}
            </span>
            <TeamBadges teams={user.teams} teamMap={teamMap} />
          </div>
          <span className="flex items-center text-11-400 text-gray-100-opacity-60 md:text-12-400">
            {user.email}
          </span>
        </div>

        {/* lg */}
        <div className="hidden lg:flex lg:items-center lg:gap-8">
          <span className="text-16-700 text-gray-100">{user.username}</span>
          <span className="text-13-400 text-gray-100-opacity-60">
            {user.email}
          </span>
          <TeamBadges teams={user.teams} teamMap={teamMap} />
        </div>
      </div>
    </div>
  );
}

export default MemberCard;

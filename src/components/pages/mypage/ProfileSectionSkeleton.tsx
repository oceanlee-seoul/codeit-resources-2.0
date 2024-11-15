import ProfileImage from "@/components/commons/ProfileImage";
import Skeleton from "@/components/commons/Skeleton";

export default function ProfileSectionSkeleton() {
  return (
    <section>
      <div className="flex items-end gap-12">
        <h2 className="text-24-700 text-gray-100">내 프로필</h2>
        <span className="text-14-500 text-gray-70">
          내 정보를 확인하세요 :)
        </span>
      </div>
      <hr className="my-16" />
      <div className="w-full rounded-10 border-2 shadow-sm md:max-w-500">
        <div className="relative h-120 rounded-t-10 bg-gradient-to-r from-purple-30 to-purple-10">
          <div className="absolute -bottom-60 left-1/2 size-120 -translate-x-1/2 rounded-full border-4 border-white shadow-md">
            <ProfileImage size="xl" />
          </div>
        </div>
        <div className="mt-80 flex flex-col items-center justify-center gap-15">
          <Skeleton className="h-24 w-54 rounded" />
          <Skeleton className="h-14 w-150 rounded" />
          <Skeleton className="mt-1 h-22 w-60 rounded-32" />
        </div>
        <div className="mb-20 mt-50 flex items-center justify-center px-20">
          <Skeleton className="h-44 w-full rounded-8" />
        </div>
      </div>
    </section>
  );
}

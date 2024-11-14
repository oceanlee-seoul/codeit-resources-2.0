import ProfileImage from "@/components/commons/ProfileImage";
import Skeleton from "@/components/commons/Skeleton";
import React from "react";

function MemberSkeleton() {
  return (
    <div className="mt-24 flex flex-col gap-16">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="rounded-12 border bg-gray-0 px-16 py-10 md:px-22 md:py-12"
        >
          <div className="flex items-center gap-12 md:gap-16">
            <div className="relative flex-shrink-0">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-50" />
              <div
                className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-gray-70 opacity-75"
                style={{ animationDuration: "2s" }}
              />
            </div>

            <div className="hidden md:flex">
              <ProfileImage size="md" />
            </div>
            <div className="md:hidden">
              <ProfileImage size="sm" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
              <div className="flex flex-col lg:hidden">
                <div className="flex gap-8">
                  <Skeleton className="h-20 w-52 rounded-6" />
                  <Skeleton className="h-20 w-40 rounded-6" />
                </div>
                <Skeleton className="mt-6 h-16 w-150 rounded-6 md:mt-9" />
              </div>

              <div className="hidden lg:flex lg:items-center lg:gap-8">
                <Skeleton className="h-20 w-52 rounded-6" />
                <Skeleton className="h-20 w-150 rounded-6" />
                <Skeleton className="h-20 w-40 rounded-6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MemberSkeleton;

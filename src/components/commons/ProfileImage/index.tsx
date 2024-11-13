/* eslint-disable @next/next/no-img-element */
import QUERY_KEY, { DEFAULT_STALE_TIME } from "@/constants/queryKey";
import { getImageUrl } from "@/lib/api/amplify/storage";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  /** imagePath를 지정합니다. */
  imagePath?: string;
  /** ProfileImage 컴포넌트의 사이즈를 지정합니다. */
  size?: "sm" | "md" | "lg" | "xl";
  /** 접근성 향상을 위해 user를 지정합니다. */
  userName?: string;
}

const DEFAULT_IMAGE = "/images/default-profile.png";

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 72,
  xl: 120,
};

export default function ProfileImage({
  imagePath,
  size = "md",
  userName,
}: Props) {
  const widthHeight = sizeMap[size];
  // const [imageSrc, setImageSrc] = useState(imagePath);

  // const { data: imageUrl } = useQuery({
  //   queryKey: [QUERY_KEY.PROFILE_IMAGE, imagePath],
  //   queryFn: () => imagePath && getImageUrl(imagePath),
  //   enabled: !!imagePath,
  //   staleTime: DEFAULT_STALE_TIME,
  // });

  // const classnames = clsx("rounded-full object-cover", {
  //   "size-32": size === "sm",
  //   "size-40": size === "md",
  //   "size-72": size === "lg",
  //   "size-120": size === "xl",
  // });

  // useEffect(() => {
  //   if (imagePath) setImageSrc(imagePath);

  //   console.log(imageSrc);
  // }, [imagePath]);

  return (
    <Image
      src={imagePath || DEFAULT_IMAGE}
      alt={userName ? `${userName}의 profile` : "profile"}
      width={widthHeight}
      height={widthHeight}
      className="rounded-full object-cover"
      // onError={() => setImageSrc(DEFAULT_IMAGE)}
    />
  );
}

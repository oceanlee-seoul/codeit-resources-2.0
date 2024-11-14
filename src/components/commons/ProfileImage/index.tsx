import Image from "next/image";

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

import Button from "@/components/commons/Button";
import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex h-screen w-full flex-col items-center justify-center text-center">
      <Image
        alt="코드잇 로고"
        src="/images/codeit.svg"
        height={78}
        width={78}
      />
      <h1 className="my-40 mb-8 text-28-700 md:text-38-700">
        <span className="block md:inline-block">해당 페이지가 없거나</span>{" "}
        <span>접근할 수 없어요</span>
      </h1>
      <p className="text-16-400">입력하신 주소가 맞는지 다시 확인 주세요</p>
      <Link href="/" className="mt-40">
        <Button variant="secondary">대시보드로 가기</Button>
      </Link>
    </div>
  );
}

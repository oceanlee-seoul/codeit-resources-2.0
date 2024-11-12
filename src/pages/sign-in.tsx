import Button from "@/components/commons/Button";
import SignInForm from "@/components/pages/sign-in/SignInForm";
import CodeitTextLogo from "@public/images/codeit-resources.svg";
import CodeitLogo from "@public/images/codeit.svg";
import { signIn } from "next-auth/react";
import Link from "next/link";

function SignIn() {
  return (
    <div className="mt-120 flex flex-col items-center justify-center gap-33 px-8 md:mt-240">
      <div className="flex flex-col items-center gap-24">
        <CodeitLogo width={78} height={78} aria-label="Codeit 로고" />
        <CodeitTextLogo
          width={254}
          height={31}
          aria-label="Codeit 텍스트 로고"
        />
      </div>
      <SignInForm />
      <div className="h-50">
        <Button
          variant="secondary"
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          구글 로그인 하기
        </Button>
      </div>
      <Link
        href="/find-password"
        className="cursor-pointer text-14-400 text-gray-80 hover:text-gray-100"
      >
        비밀번호 찾기
      </Link>
    </div>
  );
}

export default SignIn;

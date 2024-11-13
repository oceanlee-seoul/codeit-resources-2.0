import GoogleLogo from "@public/icons/icon-google.svg";
import CodeitTextLogo from "@public/images/codeit-resources.svg";
import CodeitLogo from "@public/images/codeit.svg";
import { signIn } from "next-auth/react";

function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mb-60 flex flex-col items-center justify-center gap-48 px-8">
        <div className="flex flex-col items-center gap-24">
          <CodeitLogo />
          <CodeitTextLogo />
        </div>

        <div className="flex flex-col gap-12">
          <div className="text-center text-13-500 text-gray-80">
            <p>
              <span className="font-semibold text-purple-600">@codeit.com</span>{" "}
              도메인의 계정만 로그인이 가능합니다
            </p>
          </div>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex items-center gap-12 rounded-lg border px-28 py-14 shadow-md transition-shadow hover:shadow-lg"
          >
            <GoogleLogo className="size-26" />
            <span className="text-16-500 text-gray-90">
              Google Workspace 계정으로 로그인
            </span>
          </button>
        </div>

        <div className="text-center text-12-400 text-gray-70">
          <p>도움이 필요하신가요?</p>
          <p className="mt-1">
            관리자에게 문의하거나{" "}
            <span className="text-purple-600">2000조</span>에게 연락해주세요
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;

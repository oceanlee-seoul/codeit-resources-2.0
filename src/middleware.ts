import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // 공개 경로
  const publicPaths = ["/sign-in", "/api/auth", "/404"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 404 페이지 처리
  if (pathname === "/404") {
    return NextResponse.next();
  }

  // 공개 경로인 경우 토큰 체크를 하지 않음
  if (isPublicPath) {
    // 토큰이 있는 경우에만 홈으로 리다이렉트
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 비공개 경로이면서 토큰이 없는 경우 로그인 페이지로
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

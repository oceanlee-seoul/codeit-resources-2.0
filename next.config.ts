import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // 기존의 SVG 파일 처리를 제거하고, 새로운 처리기를 추가합니다.
    config.module.rules.push({
      test: /\.svg$/, // .svg 파일을 대상으로 설정
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true, // SVG 파일을 컴포넌트로 사용할 때 크기를 아이콘으로 자동 설정
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;

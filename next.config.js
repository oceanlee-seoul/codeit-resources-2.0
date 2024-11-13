/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            dimensions: true,
            icon: false,
          },
        },
      ],
    });

    return config;
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;

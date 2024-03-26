/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // experimental: {
  //   fontLoaders: [
  //     { loader: "@next/font/google", options: { subsets: ["latin"] } },
  //   ],
  // },
  images: {
    domains: [`static.spooncast.net`],
  },
  // 웹팩을 통해 svg 파일을 리액트 컴포넌트로 변환하는 설정이다
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    const externals = ["canvas", "bufferutil", "utf-8-validate"];

    if (typeof config.externals === "function") {
      const originalExternals = config.externals;
      config.externals = async (...args) => {
        const resolvedExternals = await originalExternals(...args);
        if (Array.isArray(resolvedExternals)) {
          return [...resolvedExternals, ...externals];
        }
        return externals;
      };
    } else if (Array.isArray(config.externals)) {
      config.externals.push(...externals);
    } else if (typeof config.externals === "object") {
      for (const external of externals) {
        config.externals[external] = `commonjs ${external}`;
      }
    } else {
      // 기본적으로 externls가 없거나 다른 형태일 경우 array 형태로 지정
      config.externals = externals;
    }

    return config;
  },
};

module.exports = nextConfig;

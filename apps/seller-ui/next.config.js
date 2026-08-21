// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next')


/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  images: {
    loader: "default",
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'ik.imagekit.io',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/product/:path*',
        destination: 'http://localhost:8080/product/:path*',
      },
    ]
  },
}

const plugins = [
  withNx,
]

module.exports = composePlugins(...plugins)(nextConfig)
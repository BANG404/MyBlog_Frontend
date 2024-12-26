/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用图像优化以减少构建复杂性
  images: {
    unoptimized: true,
  },
  // 配置 webpack
  webpack: (config, { dev, isServer }) => {
    // 开发环境下禁用缓存
    if (dev) {
      config.cache = false
    }
    return config
  },
  // 添加实验性特性配置
  experimental: {
    // 禁用部分实验性功能以提高稳定性
    optimizeCss: false,
    modern: true
  }
}

module.exports = nextConfig

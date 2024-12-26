/** @type {import('next').NextConfig} */
// next.config.mjs
const config = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
  };
  
  export default config;
  
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    basePath: '/meldapp',
  trailingSlash: true, // Ensures static files work correctly
}

module.exports = nextConfig

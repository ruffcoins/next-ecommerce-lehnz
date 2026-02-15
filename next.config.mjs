/**
 * NEXT.JS CONFIGURATION
 * 
 * Purpose: Configures Next.js to work with Mongoose/MongoDB in serverless environments.
 * Handles webpack configuration to exclude optional MongoDB dependencies.
 * 
 * Architecture Role:
 * - Build Configuration: Ensures proper bundling for serverless deployment
 * - MongoDB Compatibility: Prevents errors from optional native modules
 * - Server Components: Marks mongoose as external package for server components
 * 
 * Used By: Next.js build process
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["mongoose", "mongodb"],
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '192.168.0.103',
                port: '8001',
                pathname: '/images/**',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "snappy": false,
            "aws-crt": false,
            "@aws-sdk/credential-providers": false,
            "@mongodb-js/zstd": false,
            "gcp-metadata": false,
            "kerberos": false,
            "mongodb-client-encryption": false,
            "socks": false,
            "aws4": false,
        };
        return config;
    },
};

export default nextConfig;

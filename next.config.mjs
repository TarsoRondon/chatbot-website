import nextPwa from "next-pwa"

/** @type {import('next').NextConfig} */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")
const offlineFallback = basePath ? `${basePath}/offline.html` : "/offline.html"

const runtimeCaching = [
    {
        urlPattern: ({ url }) => {
            const isSameOrigin = self.origin === url.origin
            if (!isSameOrigin) return false
            return url.pathname.startsWith(`${basePath}/api/`)
        },
        handler: "NetworkOnly",
        method: "GET",
        options: {},
    },
    {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "google-fonts-webfonts",
            expiration: {
                maxEntries: 8,
                maxAgeSeconds: 365 * 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "google-fonts-stylesheets",
            expiration: {
                maxEntries: 8,
                maxAgeSeconds: 7 * 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "static-font-assets",
            expiration: {
                maxEntries: 8,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "static-image-assets",
            expiration: {
                maxEntries: 128,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "next-image",
            expiration: {
                maxEntries: 128,
                maxAgeSeconds: 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "static-js-assets",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        method: "GET",
        options: {
            cacheName: "static-style-assets",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 24 * 60 * 60,
            },
        },
    },
    {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: "NetworkFirst",
        method: "GET",
        options: {
            cacheName: "next-data",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 24 * 60 * 60,
            },
            networkTimeoutSeconds: 10,
        },
    },
    {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: "NetworkFirst",
        method: "GET",
        options: {
            cacheName: "static-data-assets",
            expiration: {
                maxEntries: 32,
                maxAgeSeconds: 24 * 60 * 60,
            },
            networkTimeoutSeconds: 10,
        },
    },
    {
        urlPattern: ({ url }) => {
            const isSameOrigin = self.origin === url.origin
            if (!isSameOrigin) return false
            if (url.pathname.startsWith(`${basePath}/api/`)) return false
            return true
        },
        handler: "NetworkFirst",
        method: "GET",
        options: {
            cacheName: "pages",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 24 * 60 * 60,
            },
            networkTimeoutSeconds: 3,
        },
    },
    {
        urlPattern: ({ url }) => self.origin !== url.origin,
        handler: "NetworkFirst",
        method: "GET",
        options: {
            cacheName: "cross-origin",
            expiration: {
                maxEntries: 32,
                maxAgeSeconds: 6 * 60 * 60,
            },
            networkTimeoutSeconds: 10,
        },
    },
]

const withPWA = nextPwa({
    dest: "public",
    register: true,
    skipWaiting: true,
    clientsClaim: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching,
    customWorkerDir: "worker",
    fallbacks: {
        document: offlineFallback,
    },
})

const nextConfig = {
    ...(basePath ? { basePath, assetPrefix: basePath } : {}),
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "**.amazonaws.com" },
        ],
    },
}

export default withPWA(nextConfig)

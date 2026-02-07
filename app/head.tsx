const themeColor = "#0A5D54"

export default function Head() {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")
  const manifestHref = `${basePath}/manifest.webmanifest`

  return (
    <>
      <link rel="manifest" href={manifestHref} />
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Chatbot" />
      <link rel="apple-touch-icon" href={`${basePath}/icons/apple-touch-icon.png`} />
    </>
  )
}

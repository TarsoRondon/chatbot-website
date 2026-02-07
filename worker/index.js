/* eslint-disable no-restricted-globals */

self.addEventListener("message", (event) => {
  if (!event?.data) return
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})


import { registerSW } from "virtual:pwa-register"

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    const shouldUpdate = window.confirm(
      "A new version is available. Update now?"
    )

    if (shouldUpdate) {
      void updateSW?.(true)
    }
  },

  onOfflineReady() {
    console.log("App is ready to work offline.")
  },
})

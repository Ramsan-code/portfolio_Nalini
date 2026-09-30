import { configureStore } from "@reduxjs/toolkit"
import chat from "./chatSlice"
import projectsFilter from "./projectsFilterSlice"
import terminal from "./terminalSlice"

export const CHAT_STORAGE_KEY = "nr-chat-v1"

export function makeStore() {
  const store = configureStore({
    reducer: { chat, terminal, projectsFilter },
  })

  // Persist the chat conversation to sessionStorage (client only).
  if (typeof window !== "undefined") {
    let last = store.getState().chat.messages
    store.subscribe(() => {
      const messages = store.getState().chat.messages
      if (messages === last) return
      last = messages
      try {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
      } catch {
        // storage full or disabled: the chat still works in memory
      }
    })
  }

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

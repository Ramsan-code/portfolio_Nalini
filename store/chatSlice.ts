import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { FaqEntry } from "@/data/types"

export interface ChatMessage {
  id: string
  from: "bot" | "user"
  text: string
  action?: FaqEntry["action"]
  /** Show WhatsApp + email buttons (used by the fallback reply) */
  contactOptions?: boolean
}

export interface ChatState {
  open: boolean
  typing: boolean
  messages: ChatMessage[]
}

const initialState: ChatState = { open: false, typing: false, messages: [] }

let counter = 0
const makeId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setOpen(state, action: PayloadAction<boolean>) {
      state.open = action.payload
    },
    setTyping(state, action: PayloadAction<boolean>) {
      state.typing = action.payload
    },
    addMessage: {
      reducer(state, action: PayloadAction<ChatMessage>) {
        state.messages.push(action.payload)
      },
      prepare(message: Omit<ChatMessage, "id">) {
        return { payload: { ...message, id: makeId() } }
      },
    },
    hydrate(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload
    },
    resetChat(state) {
      state.messages = []
      state.typing = false
    },
  },
})

export const { setOpen, setTyping, addMessage, hydrate, resetChat } = chatSlice.actions
export default chatSlice.reducer

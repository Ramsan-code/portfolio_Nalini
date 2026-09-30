import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface TerminalLine {
  id: number
  kind: "input" | "output" | "error" | "system"
  text: string
}

interface TerminalState {
  lines: TerminalLine[]
  /** Commands the user ran, oldest first */
  history: string[]
  nextId: number
}

const initialState: TerminalState = {
  lines: [],
  history: [],
  nextId: 1,
}

const MAX_HISTORY = 50

const terminalSlice = createSlice({
  name: "terminal",
  initialState,
  reducers: {
    pushLines(state, action: PayloadAction<Omit<TerminalLine, "id">[]>) {
      for (const line of action.payload) {
        state.lines.push({ ...line, id: state.nextId++ })
      }
    },
    recordCommand(state, action: PayloadAction<string>) {
      const cmd = action.payload.trim()
      if (!cmd) return
      if (state.history[state.history.length - 1] !== cmd) state.history.push(cmd)
      if (state.history.length > MAX_HISTORY) state.history.shift()
    },
    clearLines(state) {
      state.lines = []
    },
  },
})

export const { pushLines, recordCommand, clearLines } = terminalSlice.actions
export default terminalSlice.reducer

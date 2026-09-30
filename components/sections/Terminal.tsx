"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { profile } from "@/data/profile"
import { complete, quickCommands, runCommand, type TerminalEffect } from "@/lib/terminal-commands"
import { scrollToTarget } from "@/lib/scroll"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { clearLines, pushLines, recordCommand, type TerminalLine } from "@/store/terminalSlice"
import { TerminalFrame } from "./TerminalFrame"

const PROMPT = "guest@nalini:~$"

/** Turns URLs and mailto: links in output into anchors. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/((?:https?:\/\/|mailto:)[^\s,]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^(https?:\/\/|mailto:)/.test(part) ? (
          <a
            key={i}
            href={part}
            target={part.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="text-[#2DD4BF] underline underline-offset-2 hover:text-[#5EEAD4]"
          >
            {part.replace(/^mailto:/, "")}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

const lineColor: Record<TerminalLine["kind"], string> = {
  input: "text-[#F0EEE9]",
  output: "text-[#C9D1DB]",
  error: "text-[#FDA4AF]",
  system: "text-[#9AA4B2]",
}

export default function Terminal() {
  const lines = useAppSelector((s) => s.terminal.lines)
  const history = useAppSelector((s) => s.terminal.history)
  const dispatch = useAppDispatch()
  const { setTheme } = useTheme()

  const [value, setValue] = useState("")
  const [caret, setCaret] = useState(0)
  const [focused, setFocused] = useState(false)
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Welcome message once per session
  const greeted = useRef(false)
  useEffect(() => {
    if (greeted.current || lines.length > 0) return
    greeted.current = true
    dispatch(
      pushLines([
        { kind: "system", text: `Welcome to ${profile.name}'s portfolio shell.` },
        { kind: "system", text: "Type `help` to see what you can do, or tap a command below." },
      ])
    )
  }, [dispatch, lines.length])

  // Keep the newest output in view
  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function applyEffect(effect: TerminalEffect) {
    switch (effect.type) {
      case "clear":
        dispatch(clearLines())
        break
      case "theme":
        setTheme(effect.value)
        break
      case "download": {
        const a = document.createElement("a")
        a.href = effect.href
        a.download = ""
        document.body.appendChild(a)
        a.click()
        a.remove()
        break
      }
      case "scroll-top":
        setTimeout(() => {
          scrollToTarget(0)
          document.getElementById("home")?.focus({ preventScroll: true })
        }, 300)
        break
    }
  }

  function execute(command: string) {
    const cmd = command.trim()
    dispatch(pushLines([{ kind: "input", text: `${PROMPT} ${cmd}` }]))
    if (cmd) {
      dispatch(recordCommand(cmd))
      const result = runCommand(cmd)
      if (result.output.length) {
        dispatch(pushLines(result.output.map((text) => ({ kind: result.error ? "error" : "output", text }))))
      }
      if (result.effect) applyEffect(result.effect)
    }
    setValue("")
    setCaret(0)
    setHistoryIndex(null)
  }

  function setInput(next: string) {
    setValue(next)
    setCaret(next.length)
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(next.length, next.length))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      execute(value)
    } else if (e.key === "ArrowUp") {
      if (history.length === 0) return
      e.preventDefault()
      const idx = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(idx)
      setInput(history[idx] ?? "")
    } else if (e.key === "ArrowDown") {
      if (historyIndex === null) return
      e.preventDefault()
      const idx = historyIndex + 1
      if (idx >= history.length) {
        setHistoryIndex(null)
        setInput("")
      } else {
        setHistoryIndex(idx)
        setInput(history[idx] ?? "")
      }
    } else if (e.key === "Tab" && value.trim()) {
      // Only capture Tab while there is something to complete, so keyboard users can still tab out
      const result = complete(value)
      if (result.value) {
        e.preventDefault()
        setInput(result.value)
      } else if (result.options) {
        e.preventDefault()
        dispatch(pushLines([
          { kind: "input", text: `${PROMPT} ${value}` },
          { kind: "system", text: result.options.join("   ") },
        ]))
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      dispatch(clearLines())
    }
  }

  const syncCaret = () => setCaret(inputRef.current?.selectionStart ?? value.length)
  const before = value.slice(0, caret)
  const atCaret = value[caret] ?? " "
  const after = value.slice(caret + 1)

  return (
    <div>
      <TerminalFrame>
        <div
          className="flex h-full flex-col"
          onClick={() => {
            if (!window.getSelection()?.toString()) inputRef.current?.focus()
          }}
        >
          <div
            ref={outputRef}
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            data-lenis-prevent
            tabIndex={0}
            className="flex-1 overflow-y-auto px-4 pt-4 pb-2 focus-visible:outline-offset-[-2px]"
          >
            {lines.map((line) => (
              <p key={line.id} className={`break-words whitespace-pre-wrap ${lineColor[line.kind]}`}>
                <Linkified text={line.text} />
              </p>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault()
              execute(value)
            }}
          >
            <label htmlFor="terminal-input" className="shrink-0 text-[#2DD4BF]">
              {PROMPT}
              <span className="sr-only"> Type a command, for example help</span>
            </label>
            <div className="relative min-w-0 flex-1">
              {/* Visual mirror with a blinking block caret; the real input sits on top, transparent */}
              <div aria-hidden="true" className="pointer-events-none overflow-hidden whitespace-pre">
                <span>{before}</span>
                <span className={focused ? "animate-blink bg-[#2DD4BF] text-[#0B0F14]" : "border border-[#2DD4BF]/60"}>
                  {atCaret}
                </span>
                <span>{after}</span>
              </div>
              <input
                ref={inputRef}
                id="terminal-input"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setCaret(e.target.selectionStart ?? e.target.value.length)
                  setHistoryIndex(null)
                }}
                onKeyDown={onKeyDown}
                onKeyUp={syncCaret}
                onSelect={syncCaret}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none selection:bg-[#2DD4BF]/30"
              />
            </div>
          </form>
        </div>
      </TerminalFrame>

      <div className="mt-4">
        <p id="quick-commands-label" className="mb-2 text-sm text-muted-foreground">
          Or tap a command:
        </p>
        <ul aria-labelledby="quick-commands-label" className="flex flex-wrap gap-2">
          {quickCommands.map((cmd) => (
            <li key={cmd}>
              <button
                type="button"
                onClick={() => execute(cmd)}
                className="min-h-9 rounded-full border bg-surface px-3 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:border-primary/60 hover:text-foreground"
              >
                {cmd}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

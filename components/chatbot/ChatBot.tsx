"use client"

import { Send, X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useRef, useState, type RefObject } from "react"
import { faq, faqFallback, faqGreeting, quickReplies } from "@/data/faq"
import { profile } from "@/data/profile"
import type { FaqEntry } from "@/data/types"
import { matchFaq } from "@/lib/faq-match"
import { prefersReducedMotion } from "@/lib/motion"
import { scrollToTarget } from "@/lib/scroll"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addMessage, resetChat, setOpen, setTyping } from "@/store/chatSlice"
import { ChatMessage } from "./ChatMessage"
import { QuickReplies } from "./QuickReplies"

const quickEntries = quickReplies
  .map((id) => faq.find((f) => f.id === id))
  .filter((f): f is FaqEntry => f !== undefined)

export default function ChatBot({ launcherRef }: { launcherRef: RefObject<HTMLButtonElement | null> }) {
  const { open, typing, messages } = useAppSelector((s) => s.chat)
  const dispatch = useAppDispatch()
  const [draft, setDraft] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const pendingHash = useRef<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) dispatch(addMessage({ from: "bot", text: faqGreeting }))
  }, [open, messages.length, dispatch])

  // Keep the latest message in view
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function reply(entry: FaqEntry | null) {
    dispatch(setTyping(true))
    const delay = prefersReducedMotion() ? 250 : 700 + Math.random() * 400
    timer.current = window.setTimeout(() => {
      dispatch(setTyping(false))
      if (entry) dispatch(addMessage({ from: "bot", text: entry.answer, action: entry.action }))
      else dispatch(addMessage({ from: "bot", text: faqFallback, contactOptions: true }))
    }, delay)
  }

  function ask(text: string) {
    const q = text.trim()
    if (!q || typing) return
    dispatch(addMessage({ from: "user", text: q }))
    reply(matchFaq(q, faq))
  }

  function pick(entry: FaqEntry) {
    if (typing) return
    dispatch(addMessage({ from: "user", text: entry.question }))
    reply(entry)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => dispatch(setOpen(next))}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:bg-black/10" />
        <DialogPrimitive.Content
          data-lenis-prevent
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            document.getElementById("chat-input")?.focus()
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            const hash = pendingHash.current
            pendingHash.current = null
            if (hash) {
              scrollToTarget(hash)
              history.pushState(null, "", hash)
            } else {
              launcherRef.current?.focus()
            }
          }}
          className="fixed inset-x-2 bottom-2 z-50 flex h-[min(85dvh,640px)] flex-col overflow-hidden glass-strong rounded-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:inset-x-auto sm:right-5 sm:bottom-24 sm:h-[min(72dvh,560px)] sm:w-[380px]"
        >
          <div aria-hidden="true" className="bg-gradient-brand h-1 shrink-0" />
          <header className="flex items-center gap-3 border-b px-4 py-3">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-accent font-display text-sm font-bold text-primary">
              {profile.initials}
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="font-display text-base font-semibold">
                Ask about {profile.shortName}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-muted-foreground">
                Quick answers from my FAQ
              </DialogPrimitive.Description>
            </div>
            <button
              type="button"
              onClick={() => dispatch(resetChat())}
              className="min-h-9 rounded-full border px-3 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground"
            >
              Reset
            </button>
            <DialogPrimitive.Close className="grid size-9 place-items-center rounded-full border text-muted-foreground hover:border-primary hover:text-foreground" aria-label="Close chat">
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
            <ol role="log" aria-live="polite" aria-label="Conversation" className="space-y-3">
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  email={profile.email}
                  whatsapp={profile.whatsapp}
                  onHashLink={(hash) => {
                    pendingHash.current = hash
                    dispatch(setOpen(false))
                  }}
                />
              ))}
            </ol>
            {typing && (
              <div className="mt-3 flex items-center gap-2" role="status">
                <span className="inline-flex gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
                <span className="sr-only">Assistant is typing…</span>
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <QuickReplies entries={quickEntries} onPick={pick} disabled={typing} />
            <form
              className="flex items-center gap-2 px-4 pb-4"
              onSubmit={(e) => {
                e.preventDefault()
                ask(draft)
                setDraft("")
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your question
              </label>
              <input
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a question…"
                autoComplete="off"
                maxLength={300}
                className="h-11 min-w-0 flex-1 rounded-full border bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label="Send question"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

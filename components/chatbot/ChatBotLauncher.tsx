"use client"

import { MessageCircleQuestion } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { CHAT_STORAGE_KEY } from "@/store"
import { hydrate, setOpen, type ChatMessage } from "@/store/chatSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const loadChatBot = () => import("./ChatBot")
// The chat panel's code loads on first interaction with the launcher.
const ChatBot = dynamic(loadChatBot, { ssr: false })

export function ChatBotLauncher() {
  const open = useAppSelector((s) => s.chat.open)
  const hasMessages = useAppSelector((s) => s.chat.messages.length > 0)
  const dispatch = useAppDispatch()
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  // Restore this tab's conversation
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY)
      if (saved) dispatch(hydrate(JSON.parse(saved) as ChatMessage[]))
    } catch {
      // ignore corrupt storage
    }
  }, [dispatch])

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={open ? "Close chat" : "Open FAQ chat"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={() => void loadChatBot()}
        onFocus={() => void loadChatBot()}
        onClick={() => {
          setMounted(true)
          dispatch(setOpen(!open))
        }}
        className="bg-gradient-brand fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full text-white shadow-xl dark:text-[#0B0F14] shadow-black/25 transition-transform duration-200 hover:scale-105 focus-visible:outline-offset-4 sm:right-5 sm:bottom-5"
      >
        <MessageCircleQuestion className="size-6" aria-hidden="true" />
        {hasMessages && !open && (
          <span aria-hidden="true" className="absolute top-1 right-1 size-3 rounded-full border-2 border-background bg-primary" />
        )}
      </button>
      {(mounted || open) && <ChatBot launcherRef={ref} />}
    </>
  )
}

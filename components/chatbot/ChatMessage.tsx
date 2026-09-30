import { Bot, Download, ExternalLink, Mail, MessageCircle } from "lucide-react"
import type { ChatMessage as Message } from "@/store/chatSlice"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
  email: string
  whatsapp: string
  onHashLink: (hash: string) => void
}

const actionClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/40 bg-background px-3 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground"

export function ChatMessage({ message, email, whatsapp, onHashLink }: ChatMessageProps) {
  const fromBot = message.from === "bot"
  const action = message.action
  return (
    <li className={cn("flex gap-2", fromBot ? "justify-start" : "justify-end")}>
      {fromBot && (
        <span aria-hidden="true" className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-primary">
          <Bot className="size-4" />
        </span>
      )}
      <div className={cn("max-w-[85%] space-y-2", !fromBot && "text-right")}>
        <p
          className={cn(
            "inline-block rounded-2xl px-3.5 py-2 text-left text-sm leading-relaxed",
            fromBot ? "rounded-tl-sm bg-muted text-foreground" : "rounded-tr-sm bg-primary text-primary-foreground"
          )}
        >
          <span className="sr-only">{fromBot ? "Assistant: " : "You: "}</span>
          {message.text}
        </p>

        {action && (
          <div>
            {action.href.startsWith("#") ? (
              <a
                href={action.href}
                className={actionClass}
                onClick={(e) => {
                  e.preventDefault()
                  onHashLink(action.href)
                }}
              >
                {action.label}
              </a>
            ) : (
              <a
                href={action.href}
                className={actionClass}
                {...(action.download && { download: "" })}
                {...(action.external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {action.download ? <Download className="size-3.5" aria-hidden="true" /> : <ExternalLink className="size-3.5" aria-hidden="true" />}
                {action.label}
                {action.external && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            )}
          </div>
        )}

        {message.contactOptions && (
          <div className="flex flex-wrap gap-2">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={actionClass}>
              <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a href={`mailto:${email}`} className={actionClass}>
              <Mail className="size-3.5" aria-hidden="true" /> Email
            </a>
          </div>
        )}
      </div>
    </li>
  )
}

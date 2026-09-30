"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contactSchema, type ContactValues } from "@/lib/contact-schema"

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

type Status = { kind: "idle" | "success" | "error" | "unconfigured"; text: string }

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" })
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", botcheck: "" },
    mode: "onTouched",
  })
  const sending = form.formState.isSubmitting

  async function onSubmit(values: ContactValues) {
    // Honeypot filled: pretend success, send nothing
    if (values.botcheck) {
      form.reset()
      setStatus({ kind: "success", text: "Thanks! Your message has been sent." })
      return
    }

    if (!ACCESS_KEY) {
      const mailto = `mailto:${email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)}`
      const text = "The contact form isn't configured yet. Please send your message by email instead."
      setStatus({ kind: "unconfigured", text })
      toast.info("Form not configured", {
        description: text,
        action: { label: "Open email", onClick: () => (window.location.href = mailto) },
      })
      return
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          from_name: "Portfolio contact form",
          name: values.name,
          email: values.email,
          subject: `[Portfolio] ${values.subject}`,
          message: values.message,
          replyto: values.email,
          botcheck: "",
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string }
      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
      form.reset()
      const text = "Thanks! Your message has been sent. I'll get back to you soon."
      setStatus({ kind: "success", text })
      toast.success("Message sent", { description: text })
    } catch {
      const text = `Sorry, your message couldn't be sent. Please try again or email ${email}.`
      setStatus({ kind: "error", text })
      toast.error("Message not sent", { description: text })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5" aria-describedby="contact-status">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" inputMode="email" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={6} className="min-h-36 resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Honeypot: hidden from people and assistive tech */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Leave this empty
            <input type="text" tabIndex={-1} autoComplete="off" {...form.register("botcheck")} />
          </label>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" data-magnetic disabled={sending} className="h-12 rounded-full px-7 text-base">
            {sending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
            {sending ? "Sending…" : "Send message"}
          </Button>
          <p
            id="contact-status"
            role="status"
            aria-live="polite"
            className={
              status.kind === "success"
                ? "text-sm text-primary"
                : status.kind === "idle"
                  ? "sr-only"
                  : "text-sm text-destructive"
            }
          >
            {status.text}
            {status.kind === "unconfigured" && (
              <>
                {" "}
                <a href={`mailto:${email}`} className="font-medium underline underline-offset-4">
                  {email}
                </a>
              </>
            )}
          </p>
        </div>
      </form>
    </Form>
  )
}

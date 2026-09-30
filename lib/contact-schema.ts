import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: "Please enter your name." }).max(80, { error: "That name is a bit long." }),
  email: z.email({ error: "Please enter a valid email address." }),
  subject: z.string().trim().min(3, { error: "Please add a short subject." }).max(120, { error: "Keep the subject under 120 characters." }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Your message should be at least 10 characters." })
    .max(2000, { error: "Please keep your message under 2000 characters." }),
  /** Honeypot: humans never see or fill this */
  botcheck: z.string().optional(),
})

export type ContactValues = z.infer<typeof contactSchema>

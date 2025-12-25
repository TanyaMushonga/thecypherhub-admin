import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const forgotPasswordJob = client.defineJob({
  id: "send-forgot-password-email",
  name: "Send Forgot Password Email",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "send.forgot.password",
    schema: z.object({
      email: z.string(),
      token: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    const { email, token } = payload;
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await io.runTask(
      "send-email",
      async () => {
        await resend.emails.send({
          from: "TheCypherHub <support@thecypherhub.com>", // Update if you have a specific sender signature
          to: email,
          subject: "Reset your password",
          html: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });
      }
    );
  },
});

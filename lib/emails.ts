import NoteEmail from "@/emails/note";
import { Resend } from "resend";
import { extractNameFromEmail } from "./utils";
import CommentNotificationEmail from "@/emails/notification";
import NotificationEmail from "@/emails/new-article";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendConfirmationEmailAfterSubscribe = async (
  email: string,
  token: string
) => {
  const confirmationLink = `https://www.thecypherhub.tech/new-verification?token=${token}`;
  try {
    const { data, error } = await resend.emails.send({
      from: "Tanyaradzwa T Mushonga <subscriptions@thecypherhub.tech>",
      to: email,
      subject: `Welcome to The CypherHub Newsletter, ${extractNameFromEmail(email)}`,
      html: `  <table
      align="center"
      width="600"
      cellpadding="0"
      cellspacing="0"
      class="container"
      style="
        border: 1px solid #ddd;
        border-radius: 10px;
        background-color: black;
        padding: 20px;
      "
    >
      <tr>
        <td align="center">
          <img
            src="https://www.thecypherhub.tech/fallback.webp"
            alt="The CypherHub Logo"
            style="max-width: 150px; margin-bottom: 20px"
          />
        </td>
      </tr>
      <tr>
        <td align="center">
          <h2 style="color: #fff; text-align: center;">
            Thank you for subscribing to our newsletter!
          </h2>
        </td>
      </tr>
      <tr>
        <td style="font-style: italic; color: #555; text-align: center">
          "The only way to do great work is to love what you do. Keep coding,
          keep building!"
        </td>
      </tr>
      <tr>
        <td class="content">
          <p style="color: #fff">
            We're excited to have you on board  ${extractNameFromEmail(email)}. Please confirm your subscription
            by clicking the link below:
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="margin: 20px 0">
          <a
            href="${confirmationLink}"
            class="button"
            style="
              display: inline-block;
              padding: 10px 20px;
              color: #fff;
              background-color: #274463;
              text-decoration: none;
              border-radius: 5px;
            "
            >Confirm Subscription</a
          >
        </td>
      </tr>

      <tr>
        <td class="content">
          <p style="color: #fff">
           You will be receiving weekly emails about new articles, trending technology, coding tips, and
            much more. Stay tuned for exciting updates and valuable content to
            help you stay ahead in the tech world.
          </p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p style="color: #fff">
            If you did not subscribe to our newsletter, please ignore this
            email.
          </p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p style="color: #fff">Best regards,<br />Tanyaradzwa T Mushonga</p>
        </td>
      </tr>
      <tr
        style="
          padding: 20px 0;
          margin-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
        "
      >
        <td>
          <div style="display: inline-block; margin: 0 5px;">
            <a
              href="https://www.linkedin.com/in/tanyaradzwa-t-mushonga-b23745209/"
              style="margin: 0 10px"
            >
              <img
                src="https://www.thecypherhub.tech/linkedin.png"
                alt=""
                width="35"
                height="35"
                class="social-icons"
              />
            </a>
          </div>
          <div style="display: inline-block; margin: 0 5px;">
            <a href="https://wa.me/+263712389290" style="margin: 0 10px">
              <img
                src="https://www.thecypherhub.tech/whatsapp.png"
                alt=""
                width="33"
                height="33"
                class="social-icons"
              />
            </a>
          </div>
          <div style="display: inline-block; margin: 0 5px;">
            <a
              href="https://www.tanyaradzwatmushonga.me/"
              style="margin: 0 10px"
            >
              <img
                src="https://www.thecypherhub.tech/portifolio.png"
                alt=""
                width="33"
                height="33"
                class="social-icons"
              />
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="margin-top: 20px; color: #fff">
          <p style="color: #fff">Bulawayo, Zimbabwe</p>
          <p>
            <a
              href="https://thecypherhub.tech"
              style="color: #fff; text-decoration: underline"
              >thecypherhub.tech</a
            >
          </p>
        </td>
      </tr>
    </table>`,
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      throw new Error("Error sending confirmation email");
    }

    return data;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Error sending confirmation email");
  }
};

export const sendEmailToMyself = async (
  htmlContent: string,
  subject: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Tanyaradzwa T Mushonga <newsletter@thecypherhub.tech>",
      to: "tanyaradzwatmushonga@gmail.com",
      subject: `${subject}`,
      react: NoteEmail({
        htmlContent,
        email: "tanyaradzwatmushonga@gmail.com",
      }),
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      throw new Error("Error sending confirmation email");
    }

    return data;
  } catch (error) {
    console.error("Error sending email to myself:", error);
    throw new Error("Error sending email to myself");
  }
};

export const sendEmailToSubscribers = async (
  htmlContent: string,
  subject: string,
  email: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Tanyaradzwa T Mushonga <newsletter@thecypherhub.tech>",
      to: `${email}`,
      subject: `${subject}`,
      react: NoteEmail({ htmlContent, email }),
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      throw new Error("Error sending confirmation email");
    }

    return data;
  } catch (error) {
    console.error("Error sending email to myself:", error);
    throw new Error("Error sending email to myself");
  }
};

export const sendCommentNotification = async (
  articleTitle: string,
  comment: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Tanyaradzwa T Mushonga <notifications@thecypherhub.tech>",
      to: "tanyaradzwatmushonga@gmail.com",
      subject: `New Comment on "${articleTitle}"`,
      react: CommentNotificationEmail({
        articleTitle,
        comment,
      }),
    });

    if (error) {
      console.error("Error sending comment notification:", error);
      throw new Error("Error sending comment notification");
    }

    return data;
  } catch (error) {
    console.error("Error sending comment notification:", error);
    throw new Error("Error sending comment notification");
  }
};

export const sendNoteBatch = async (
  recipients: string[],
  subject: string,
  content: string
) => {
  try {
    const batchData = recipients.map((email) => ({
      from: "Tanyaradzwa T Mushonga <newsletter@thecypherhub.tech>",
      to: email,
      subject: subject,
      react: NoteEmail({ htmlContent: content, email }),
    }));

    // Resend's batch API allows up to 100 emails. We'll stick to 5-10 per client request for safety.
    const { data, error } = await resend.batch.send(batchData);

    if (error) {
      console.error("Error sending note batch:", error);
      throw new Error("Error sending note batch: " + error.message);
    }

    return data;
  } catch (error: unknown) {
    console.error("Error sending note batch:", error);
    throw new Error(
      (error as { message?: string }).message || "Error sending note batch"
    );
  }
};

export const sendArticleNotificationBatch = async (
  recipients: string[],
  article: { title: string; description: string; slug: string; content: string }
) => {
  try {
    const batchData = recipients.map((email) => ({
      from: "Tanyaradzwa T Mushonga <newsletter@thecypherhub.tech>",
      to: email,
      subject: `New: ${article.title}`,
      react: NotificationEmail({
        articleTitle: article.title,
        articleDescription: article.description,
        articleSlug: article.slug,
        email,
      }),
    }));

    const { data, error } = await resend.batch.send(batchData);

    if (error) {
      console.error("Error sending article notification batch:", error);
      throw new Error(
        "Error sending article notification batch: " + error.message
      );
    }

    return data;
  } catch (error: unknown) {
    console.error("Error sending article notification batch:", error);
    throw new Error(
      (error as { message?: string }).message ||
        "Error sending article notification batch"
    );
  }
};

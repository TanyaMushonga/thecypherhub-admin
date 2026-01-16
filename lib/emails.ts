import WelcomeEmail from "@/emails/welcome";
import NoteEmail from "@/emails/note";
import { Resend } from "resend";
import { extractNameFromEmail } from "./utils";
import CommentNotificationEmail from "@/emails/notification";
import NotificationEmail from "@/emails/new-article";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendWelcomeEmail = async (email: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Tanyaradzwa T Mushonga <subscriptions@thecypherhub.tech>",
      to: email,
      subject: `Welcome to The CypherHub Newsletter, ${extractNameFromEmail(
        email
      )}`,
      react: WelcomeEmail({ email }),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Error sending welcome email");
    }

    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Error sending welcome email");
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
  article: {
    title: string;
    description: string;
    slug: string;
    content: string;
    collectionName?: string;
    collectionDescription?: string;
    nextArticleTitle?: string;
    nextArticleDate?: string;
  }
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
        collectionName: article.collectionName,
        collectionDescription: article.collectionDescription,
        nextArticleTitle: article.nextArticleTitle,
        nextArticleDate: article.nextArticleDate,
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

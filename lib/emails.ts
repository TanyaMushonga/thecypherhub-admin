import NoteEmail from "@/emails/note";
import { Resend } from "resend";
import { extractNameFromEmail } from "./utils";

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
      subject: `Hi ${extractNameFromEmail(email)}, confirm your subscription to The Cypher Hub!`,
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
     <tr>
            <td align="center">
              <h2 style="color: #333; text-align: center; font-size: 24px;">
                Hi ${extractNameFromEmail(email)},
              </h2>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Thank you for subscribing to The Cypher Hub! We're excited to have you on board.
              </p>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Please confirm your subscription by clicking the button below:
              </p>
              <a
                href="${confirmationLink}"
                style="
                  display: inline-block;
                  padding: 10px 20px;
                  color: #fff;
                  background-color: #007bff;
                  text-decoration: none;
                  border-radius: 5px;
                  font-size: 16px;
                "
              >
                Confirm Subscription
              </a>
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

import { extractNameFromEmail } from "@/lib/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Row,
} from "@react-email/components";
import * as React from "react";

interface NotificationEmailProps {
  articleTitle: string;
  articleDescription: string;
  articleSlug: string;
  email: string;
}

export const NotificationEmail = ({
  articleTitle,
  articleDescription,
  articleSlug,
  email,
}: NotificationEmailProps) => {
  const articleLink = `https://www.thecypherhub.tech/blog/${articleSlug}`;

  return (
    <Html>
      <Head />
      <Preview>New Article: {articleTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading as="h2" style={title}>
              New Article Published
            </Heading>
            <Text style={paragraph}>
              Hie, {extractNameFromEmail(email)} its Tanya here!
            </Text>
            
            <Text style={paragraph}>
              I just published a new article that might interest you:
            </Text>
            
            <Section style={articleCard}>
                 <Heading as="h3" style={articleTitleStyle}>
                    <Link href={articleLink} style={linkTitle}>
                        {articleTitle}
                    </Link>
                 </Heading>
                 <Text style={description}>
                    {articleDescription}
                 </Text>
                 <Link href={articleLink} style={button}>
                    Read More
                 </Link>
            </Section>

            <Row>
            <Hr
              style={{
                borderColor: "rgb(209,213,219) !important",
                marginTop: "16px",
                marginBottom: "16px",
              }}
            />
            <Section
              style={{
                display: "inline-block",
                marginTop: "5px",
                maxHeight: "48px",
                maxWidth: "48px",
                textAlign: "left" as const,
              }}
            >
              <Img
                alt="Tanya Mushonga"
                height={48}
                src="https://www.thecypherhub.tech/profile.jfif"
                style={{
                  borderRadius: "9999px",
                  display: "block",
                  height: "48px",
                  objectFit: "cover",
                  objectPosition: "center",
                  width: "48px",
                }}
                width={48}
              />
            </Section>
            <Section
              style={{
                display: "inline-block",
                marginLeft: "18px",
                maxWidth: "300px",
                textAlign: "left" as const,
                verticalAlign: "top",
              }}
            >
                <Heading
                as="h3"
                style={{
                  color: "rgb(31,41,55)",
                  fontSize: "15px",
                  fontWeight: 600,
                  lineHeight: "22px",
                  margin: "0px",
                }}
              >
                Tanyaradzwa T Mushonga
              </Heading>
              <Text
                style={{
                  color: "rgb(107,114,128)",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "16px",
                  margin: "0px",
                }}
              >
                Software Engineer
              </Text>
              <Section
                style={{
                  marginTop: "8px",
                }}
              >
                <Link
                  href="https://github.com/TanyaMushonga"
                  style={{
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: 500,
                    marginRight: "10px",
                    textDecoration: "underline",
                  }}
                >
                  GitHub
                </Link>
                <Link
                  href="https://www.linkedin.com/in/tanyaradzwa-t-mushonga-b23745209/"
                  style={{
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: 500,
                    marginRight: "10px",
                    textDecoration: "underline",
                  }}
                >
                  LinkedIn
                </Link>
                <Link
                  href="https://tanyaradzwatmushonga.me"
                  style={{
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "underline",
                  }}
                >
                  Portfolio
                </Link>
              </Section>
            </Section>
          </Row>

            <Section style={footer}>
                <Text style={footerText}>
                  You&apos;re receiving this email because you subscribed to our
                  newsletter. If you don&apos;t want to receive these emails, you can
                  unsubscribe at any time.
                </Text>

                <Link
                  href="https://www.thecypherhub.tech/unsubscribe"
                  style={footerLink}
                >
                  Unsubscribe{" "}
                </Link>

                <Link href="https://www.thecypherhub.tech/" style={footerLink}>
                  Blog
                </Link>

                <Hr style={footerDivider} />

                <Text style={footerAddress}>
                  <strong>The Cypher Hub</strong>, Bulawayo, Zimbabwe
                </Text>
                <Text style={footerHeart}>{"<3"}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NotificationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  padding: "20px 0 48px",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
};

const content = {
  padding: "0 48px",
};

const title = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  textAlign: "center" as const,
  margin: "30px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "18px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const articleCard = {
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    marginTop: "20px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
};

const articleTitleStyle = {
    marginTop: "0",
    marginBottom: "10px",
    fontSize: "20px",
    fontWeight: "600",
};

const linkTitle = {
    color: "#2563eb",
    textDecoration: "none",
};

const description = {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "20px",
    marginBottom: "15px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 20px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const divider = {
  margin: "30px 0",
};

const footer = {
  width: "680px",
  maxWidth: "100%",
  margin: "32px auto 0 auto",
  padding: "0 30px",
};

const footerDivider = {
  ...divider,
  borderColor: "#d6d8db",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "15px",
  color: "#9199a1",
  margin: "0",
};

const footerLink = {
  display: "inline-block",
  color: "#9199a1",
  textDecoration: "underline",
  fontSize: "12px",
  marginRight: "10px",
  marginBottom: "0",
  marginTop: "8px",
};

const footerAddress = {
  margin: "4px 0",
  fontSize: "12px",
  lineHeight: "15px",
  color: "#9199a1",
};

const footerHeart = {
  borderRadius: "1px",
  border: "1px solid #d6d9dc",
  padding: "4px 6px 3px 6px",
  fontSize: "11px",
  lineHeight: "11px",
  fontFamily: "Consolas,monospace",
  color: "#e06c77",
  maxWidth: "min-content",
  margin: "0 0 32px 0",
};

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

            <Hr style={hr} />

            <Text style={footer}>
              You received this email because you are subscribed to The CypherHub newsletter.
              <br />
              <Link href="https://www.thecypherhub.tech" style={footerLink}>
                Visit Website
              </Link>
            </Text>
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

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#8898aa",
  textDecoration: "underline",
};

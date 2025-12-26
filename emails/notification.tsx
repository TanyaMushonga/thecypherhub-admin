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

interface CommentNotificationEmailProps {
  articleTitle: string;
  comment: string;
}

export const CommentNotificationEmail = ({
  articleTitle,
  comment,
}: CommentNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New comment on your article: {articleTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={content}>
          <Heading as="h2" style={title}>
            New Comment on {articleTitle}
          </Heading>
          <Text style={commentStyle}>{comment}</Text>
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

export default CommentNotificationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const content = {
  backgroundColor: "#ffffff",
  borderRadius: "5px",
  padding: "20px",
};

const title = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 15px",
};

const commentStyle = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 15px",
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

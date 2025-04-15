import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
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
          <Text style={footer}>
            View this comment on{" "}
            <a href="https://www.thecypherhub.tech" style={link}>
              The Cypher Hub
            </a>
          </Text>
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

const footer = {
  color: "#777",
  fontSize: "14px",
  margin: "25px 0 0",
};

const link = {
  color: "#007bff",
  textDecoration: "underline",
};

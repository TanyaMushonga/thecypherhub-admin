import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { extractNameFromEmail } from "@/lib/utils";

interface WelcomeEmailProps {
  email: string;
}

export const WelcomeEmail = ({ email }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Welcome to The Cypher Hub!</Preview>
      <Container style={container}>
        <Section style={header}>
          <Row>
            <Column style={headerContent}>
              <Heading style={headerContentTitle}>
                Welcome to The Cypher Hub
              </Heading>
              <Text style={headerContentSubtitle}>
                We&apos;re so glad to have you on board.
              </Text>
            </Column>
            <Column style={headerImageContainer}>
              <Img
                style={headerImage}
                width={380}
                src={`https://www.thecypherhub.tech/cypherhub.png`}
              />
            </Column>
          </Row>
        </Section>

        <Section style={content}>
          <Heading as="h2" style={title}>
            Hello {extractNameFromEmail(email)}!
          </Heading>

          <Text style={paragraph}>
            Thank you for subscribing to our newsletter! We&apos;re excited to
            have you on board.
          </Text>

          <Text style={paragraph}>
            &quot;The only way to do great work is to love what you do. Keep
            coding, keep building!&quot;
          </Text>

          <Text style={paragraph}>
            You will be receiving weekly emails about new articles, trending
            technology, coding tips, and much more. Stay tuned for exciting
            updates and valuable content to help you stay ahead in the tech
            world.
          </Text>

          <Text style={paragraph}>
            If you did not subscribe to our newsletter, you can safely ignore
            this email or unsubscribe below.
          </Text>

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
                textAlign: "left",
              }}
            >
              <Img
                alt="Tanya"
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
                textAlign: "left",
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
        </Section>
      </Container>

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
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: "#f3f3f5",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const headerContent = { padding: "20px 30px 15px" };

const headerContentTitle = {
  color: "#fff",
  fontSize: "25px",
  fontWeight: "bold",
  lineHeight: "24px",
};

const headerContentSubtitle = {
  color: "#fff",
  fontSize: "15px",
};

const headerImageContainer = {
  padding: "30px 10px",
};

const headerImage = {
  maxWidth: "100%",
};

const title = {
  margin: "0 0 15px",
  fontWeight: "bold",
  fontSize: "21px",
  lineHeight: "21px",
  color: "#0c0d0e",
};

const paragraph = {
  fontSize: "18px",
  lineHeight: "26px",
  color: "#3c3f44",
};

const divider = {
  margin: "30px 0",
};

const container = {
  width: "680px",
  maxWidth: "100%",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const footer = {
  width: "680px",
  maxWidth: "100%",
  margin: "32px auto 0 auto",
  padding: "0 30px",
};

const content = {
  padding: "30px 30px 40px 30px",
};

const header = {
  borderRadius: "5px 5px 0 0",
  display: "flex",
  flexDireciont: "column",
  backgroundColor: "#2b2d6e",
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

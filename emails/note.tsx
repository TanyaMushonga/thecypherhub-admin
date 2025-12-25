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
import parse from "html-react-parser";
import { extractNameFromEmail } from "@/lib/utils";

interface NoteEmailProps {
  htmlContent: string;
  email: string;
}

export const NoteEmail = ({ htmlContent, email }: NoteEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>The Cypher Hub</Preview>
      <Container style={container}>
        <Section style={header}>
          <Row>
            <Column style={headerContent}>
              <Heading style={headerContentTitle}>
                Stay Ahead with Tech Insights
              </Heading>
              <Text style={headerContentSubtitle}>
                Get expert tips, deep dives in software development.
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
            Hie {extractNameFromEmail(email)}!
          </Heading>
          <Text style={paragraph}>
            It&apos;s me again, Tanya Mushonga! I bring you another exciting
            edition of my tech blog,
          </Text>

          <Section style={paragraph}>{parse(htmlContent)}</Section>

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
                alt="Steve Jobs"
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
                maxWidth: "180px",
                textAlign: "left",
                verticalAlign: "top",
              }}
            >
              <Heading
                as="h3"
                style={{
                  color: "rgb(31,41,55)",
                  fontSize: "13px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  margin: "0px",
                }}
              >
                Tanyaradzwa T Mushonga
              </Heading>
              <Text
                style={{
                  color: "rgb(107,114,128)",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "14px",
                  margin: "0px",
                }}
              >
                Software Engineer
              </Text>
              <Section
                style={{
                  marginTop: "4px",
                }}
              >
                <Link
                  href="https://github.com/TanyaMushonga"
                  style={{
                    display: "inline-flex",
                    height: "20px",
                    width: "20px",
                  }}
                >
                  <Img
                    alt="GitHub"
                    src="https://www.thecypherhub.tech/github.png"
                    style={{ height: "17px", width: "17px" }}
                  />
                </Link>
                <Link
                  href="https://www.linkedin.com/in/tanyaradzwa-t-mushonga-b23745209/"
                  style={{
                    display: "inline-flex",
                    height: "20px",
                    marginLeft: "8px",
                    width: "20px",
                  }}
                >
                  <Img
                    alt="LinkedIn"
                    src="https://react.email/static/in-icon.png"
                    style={{ height: "17px", width: "17px" }}
                  />
                </Link>
                <Link
                  href="https://tanyaradzwatmushonga.me"
                  style={{
                    display: "inline-flex",
                    height: "20px",
                    marginLeft: "8px",
                    width: "20px",
                  }}
                >
                  <Img
                    alt="Portfolio"
                    src="https://www.thecypherhub.tech/portifolio.png"
                    style={{ height: "17px", width: "17px" }}
                  />
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

export default NoteEmail;

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
  fontSize: "17px",
  lineHeight: "21px",
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

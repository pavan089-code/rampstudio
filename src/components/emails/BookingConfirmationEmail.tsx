import type { CSSProperties } from "react";

import type { StudioSettings } from "@/types/notifications";

type BookingConfirmationEmailProps = {
  customerName: string;
  eventType: string;
  eventDate: string;
  location: string;
  packageName: string;
  callUrl: string;
  whatsappUrl: string;
  settings: StudioSettings;
};

const detailLabel: CSSProperties = {
  color: "#9f9f9f",
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const detailValue: CSSProperties = {
  color: "#f6f2ea",
  fontSize: "16px",
  marginTop: "6px",
};

export default function BookingConfirmationEmail({
  customerName,
  eventType,
  eventDate,
  location,
  packageName,
  callUrl,
  whatsappUrl,
  settings,
}: BookingConfirmationEmailProps) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          background: "#0b0b0c",
          color: "#f6f2ea",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ background: "#0b0b0c", padding: "32px 14px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    maxWidth: "640px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "#111113",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "34px 28px 18px" }}>
                        <p
                          style={{
                            color: "#c6a46c",
                            fontSize: "12px",
                            letterSpacing: "0.24em",
                            margin: 0,
                            textTransform: "uppercase",
                          }}
                        >
                          {settings.studioName}
                        </p>
                        <h1
                          style={{
                            color: "#fff",
                            fontFamily: "Georgia, Times New Roman, serif",
                            fontSize: "42px",
                            fontWeight: 400,
                            lineHeight: 1.05,
                            margin: "18px 0 0",
                          }}
                        >
                          Your booking is confirmed.
                        </h1>
                        <p
                          style={{
                            color: "#b8b8b8",
                            fontSize: "16px",
                            lineHeight: 1.8,
                            margin: "22px 0 0",
                          }}
                        >
                          Hello {customerName}, your booking has been
                          successfully confirmed. We are honored to craft this
                          story with you.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "12px 28px 8px" }}>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <tbody>
                            {[
                              ["Customer Name", customerName],
                              ["Event Type", eventType],
                              ["Event Date", eventDate],
                              ["Location", location],
                              ["Package", packageName],
                            ].map(([label, value]) => (
                              <tr key={label}>
                                <td
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.08)",
                                    padding: "18px 20px",
                                  }}
                                >
                                  <div style={detailLabel}>{label}</div>
                                  <div style={detailValue}>{value}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "24px 28px 34px" }}>
                        <table role="presentation" cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: "10px", paddingBottom: "10px" }}>
                                <a href={callUrl} style={buttonStyle}>
                                  Call Studio
                                </a>
                              </td>
                              <td style={{ paddingRight: "10px", paddingBottom: "10px" }}>
                                <a href={whatsappUrl} style={buttonStyle}>
                                  WhatsApp
                                </a>
                              </td>
                              <td style={{ paddingBottom: "10px" }}>
                                <a href={settings.websiteUrl} style={outlineButtonStyle}>
                                  Website
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                            color: "#8f8f8f",
                            fontSize: "13px",
                            lineHeight: 1.8,
                            margin: "24px 0 0",
                            paddingTop: "18px",
                          }}
                        >
                          {settings.studioName}
                          <br />
                          {settings.studioPhone} | {settings.studioEmail}
                          <br />
                          <a href={settings.instagramUrl} style={footerLinkStyle}>
                            Instagram
                          </a>{" "}
                          |{" "}
                          <a href={settings.websiteUrl} style={footerLinkStyle}>
                            Website
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

const buttonStyle: CSSProperties = {
  background: "#c6a46c",
  color: "#090909",
  display: "inline-block",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  padding: "13px 18px",
  textDecoration: "none",
  textTransform: "uppercase",
};

const outlineButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "transparent",
  border: "1px solid #c6a46c",
  color: "#c6a46c",
};

const footerLinkStyle: CSSProperties = {
  color: "#c6a46c",
  textDecoration: "none",
};

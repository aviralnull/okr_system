

import * as React from "react";

interface Props {
  resetLink: string;
  userName: string;
  expiresIn: string;
  orgName: string;
  orgLogo?: string | null;
  primaryColor?: string;
}

export function ForgotPasswordEmail({
  resetLink,
  userName,
  expiresIn,
  orgName,
  orgLogo,
  primaryColor = "#6366f1",
}: Props) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{`Reset your ${orgName} password`}</title>
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f8f9fa",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "40px 20px",
          }}
        >
          <tbody>
            <tr>
              <td align="center">

                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    maxWidth: "520px",
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow:
                      "0 4px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <tbody>

                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: primaryColor,
                          padding: "32px 40px",
                          textAlign: "center",
                        }}
                      >

                        {/* Organization Logo */}
                        {orgLogo ? (
                          <img
                            src={orgLogo}
                            alt={orgName}
                            width="64"
                            height="64"
                            style={{
                              display: "block",
                              width: "64px",
                              height: "64px",
                              objectFit: "contain",
                              margin: "0 auto 16px",
                              borderRadius: "12px",
                              backgroundColor: "#ffffff",
                              padding: "6px",
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "12px",
                              backgroundColor:
                                "rgba(255,255,255,0.2)",
                              display: "inline-block",
                              marginBottom: "16px",
                              lineHeight: "48px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                color: "#ffffff",
                                fontSize: "22px",
                                fontWeight: "700",
                              }}
                            >
                              {orgName
                                .slice(0, 1)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Organization name */}
                        <h1
                          style={{
                            color: "#ffffff",
                            fontSize: "22px",
                            fontWeight: "700",
                            margin: "0 0 6px",
                            letterSpacing: "-0.3px",
                          }}
                        >
                          {orgName}
                        </h1>

                        <p
                          style={{
                            color:
                              "rgba(255,255,255,0.75)",
                            fontSize: "13px",
                            margin: 0,
                          }}
                        >
                          Goal tracking for modern teams
                        </p>

                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td
                        style={{
                          padding: "36px 40px",
                        }}
                      >
                        <h2
                          style={{
                            color: "#111827",
                            fontSize: "20px",
                            fontWeight: "600",
                            margin: "0 0 8px",
                          }}
                        >
                          Reset your password 🔑
                        </h2>

                        <p
                          style={{
                            color: "#6b7280",
                            fontSize: "14px",
                            margin: "0 0 24px",
                            lineHeight: "1.6",
                          }}
                        >
                          Hi{" "}
                          <strong
                            style={{ color: "#374151" }}
                          >
                            {userName}
                          </strong>
                          , we received a request to reset
                          your password. Click the button
                          below — this link expires in{" "}
                          <strong
                            style={{ color: "#374151" }}
                          >
                            {expiresIn}
                          </strong>
                          .
                        </p>

                        {/* Warning box */}
                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            backgroundColor: "#fffbeb",
                            borderRadius: "10px",
                            marginBottom: "28px",
                            border:
                              "1px solid #fde68a",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding: "14px 18px",
                                }}
                              >
                                <p
                                  style={{
                                    color: "#92400e",
                                    fontSize: "13px",
                                    margin: 0,
                                    lineHeight: "1.5",
                                  }}
                                >
                                  ⚠️ If you didn't request
                                  this, ignore this email.
                                  Your password won't change.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* CTA */}
                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            marginBottom: "24px",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td align="center">
                                <a
                                  href={resetLink}
                                  style={{
                                    display:
                                      "inline-block",
                                    backgroundColor:
                                      primaryColor,
                                    color: "#ffffff",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    textDecoration:
                                      "none",
                                    padding:
                                      "13px 32px",
                                    borderRadius: "10px",
                                  }}
                                >
                                  Reset Password →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            textAlign: "center",
                            margin: "0 0 10px",
                          }}
                        >
                          Or copy this link:
                        </p>

                        <div
                          style={{
                            backgroundColor: "#f3f4f6",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            marginBottom: "24px",
                          }}
                        >
                          <p
                            style={{
                              color: primaryColor,
                              fontSize: "11px",
                              margin: 0,
                              wordBreak: "break-all",
                              fontFamily: "monospace",
                            }}
                          >
                            {resetLink}
                          </p>
                        </div>

                        <p
                          style={{
                            color: "#d1d5db",
                            fontSize: "12px",
                            textAlign: "center",
                            margin: 0,
                          }}
                        >
                          ⏰ Link expires in{" "}
                          <strong>{expiresIn}</strong>
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#f9fafb",
                          padding: "20px 40px",
                          borderTop:
                            "1px solid #f3f4f6",
                        }}
                      >
                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "11px",
                            textAlign: "center",
                            margin: 0,
                            lineHeight: "1.6",
                          }}
                        >
                          © {new Date().getFullYear()}{" "}
                          {orgName}. All rights reserved.
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

import * as React from "react";

interface Props {
  inviteLink: string;
  orgName: string;
  orgLogo?: string | null;
  primaryColor?: string;
  inviterName: string;
  role: string;
  email: string;
  expiresIn: string;
}

export function InviteEmail({
  inviteLink,
  orgName,
  orgLogo,
  primaryColor = "#6366f1",
  inviterName,
  role,
  email,
  expiresIn,
}: Props) {
  const roleLabel =
    role === "MANAGER"
      ? "Manager"
      : role === "HR"
        ? "HR"
        : "Employee";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{`You're invited to ${orgName}`}</title>
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

                    {/* ─────────────────────────
                        Header
                    ───────────────────────── */}

                    <tr>
                      <td
                        style={{
                          backgroundColor: primaryColor,
                          padding: "32px 40px",
                          textAlign: "center",
                        }}
                      >

                        {/* Company Logo */}

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
                              backgroundColor:
                                "rgba(255,255,255,0.95)",
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

                    {/* ─────────────────────────
                        Body
                    ───────────────────────── */}

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
                            letterSpacing: "-0.2px",
                          }}
                        >
                          You've been invited! 🎉
                        </h2>

                        <p
                          style={{
                            color: "#6b7280",
                            fontSize: "14px",
                            margin: "0 0 24px",
                            lineHeight: "1.6",
                          }}
                        >
                          <strong
                            style={{
                              color: "#374151",
                            }}
                          >
                            {inviterName}
                          </strong>{" "}
                          has invited you to join{" "}
                          <strong
                            style={{
                              color: "#374151",
                            }}
                          >
                            {orgName}
                          </strong>{" "}
                          as a{" "}
                          <strong
                            style={{
                              color: primaryColor,
                            }}
                          >
                            {roleLabel}
                          </strong>
                          .
                        </p>

                        {/* Info box */}

                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            backgroundColor: "#f8f7ff",
                            borderRadius: "10px",
                            marginBottom: "28px",
                            border:
                              "1px solid #e0e7ff",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding: "16px 20px",
                                }}
                              >
                                <table
                                  width="100%"
                                  cellPadding="0"
                                  cellSpacing="0"
                                >
                                  <tbody>

                                    <tr>
                                      <td
                                        style={{
                                          paddingBottom:
                                            "10px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#9ca3af",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            textTransform:
                                              "uppercase",
                                            letterSpacing:
                                              "0.05em",
                                          }}
                                        >
                                          Email
                                        </span>

                                        <p
                                          style={{
                                            color:
                                              "#374151",
                                            fontSize:
                                              "13px",
                                            margin:
                                              "2px 0 0",
                                            fontWeight:
                                              "500",
                                          }}
                                        >
                                          {email}
                                        </p>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td
                                        style={{
                                          paddingBottom:
                                            "10px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#9ca3af",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            textTransform:
                                              "uppercase",
                                            letterSpacing:
                                              "0.05em",
                                          }}
                                        >
                                          Organization
                                        </span>

                                        <p
                                          style={{
                                            color:
                                              "#374151",
                                            fontSize:
                                              "13px",
                                            margin:
                                              "2px 0 0",
                                            fontWeight:
                                              "500",
                                          }}
                                        >
                                          {orgName}
                                        </p>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td>
                                        <span
                                          style={{
                                            color: "#9ca3af",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            textTransform:
                                              "uppercase",
                                            letterSpacing:
                                              "0.05em",
                                          }}
                                        >
                                          Role
                                        </span>

                                        <p
                                          style={{
                                            color:
                                              primaryColor,
                                            fontSize:
                                              "13px",
                                            margin:
                                              "2px 0 0",
                                            fontWeight:
                                              "600",
                                          }}
                                        >
                                          {roleLabel}
                                        </p>
                                      </td>
                                    </tr>

                                  </tbody>
                                </table>
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
                                  href={inviteLink}
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
                                    borderRadius:
                                      "10px",
                                    letterSpacing:
                                      "-0.1px",
                                  }}
                                >
                                  Accept Invitation →
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
                            margin: "0 0 20px",
                          }}
                        >
                          Or copy this link:
                        </p>

                        <div
                          style={{
                            backgroundColor:
                              "#f3f4f6",
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
                              fontFamily:
                                "monospace",
                            }}
                          >
                            {inviteLink}
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
                          ⏰ This invitation expires in{" "}
                          <strong>{expiresIn}</strong>
                        </p>

                      </td>
                    </tr>

                    {/* Footer */}

                    <tr>
                      <td
                        style={{
                          backgroundColor:
                            "#f9fafb",
                          padding:
                            "20px 40px",
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
                          If you didn't expect this
                          invitation, you can safely
                          ignore this email.
                          <br />
                          ©{" "}
                          {new Date().getFullYear()}{" "}
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

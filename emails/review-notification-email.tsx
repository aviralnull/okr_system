
import * as React from "react";

interface Props {
  employeeName: string;
  reviewerName: string;
  orgName: string;
  reviewPeriod: string;
  rating: number;
  dashboardLink: string;

  // Organization branding
  orgLogo?: string | null;
  primaryColor?: string;
}

export function ReviewNotificationEmail({
  employeeName,
  reviewerName,
  orgName,
  reviewPeriod,
  rating,
  dashboardLink,
  orgLogo,
  primaryColor = "#6366f1",
}: Props) {
  const roundedRating = Math.max(
    0,
    Math.min(5, Math.round(rating))
  );

  const stars =
    "★".repeat(roundedRating) +
    "☆".repeat(5 - roundedRating);

  const ratingLabel =
    rating >= 4.5
      ? "Exceptional 🌟"
      : rating >= 3.5
        ? "Strong ⭐"
        : rating >= 2.5
          ? "Satisfactory 👍"
          : "Needs Improvement 📈";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>
          {`New performance review - ${orgName}`}
        </title>
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

                        {/* Organization Name */}

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
                          }}
                        >
                          New performance review 📋
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
                            style={{
                              color: "#374151",
                            }}
                          >
                            {employeeName}
                          </strong>
                          ,{" "}
                          <strong
                            style={{
                              color: "#374151",
                            }}
                          >
                            {reviewerName}
                          </strong>{" "}
                          has submitted your{" "}
                          <strong
                            style={{
                              color: "#374151",
                            }}
                          >
                            {reviewPeriod}
                          </strong>{" "}
                          performance review at{" "}
                          <strong
                            style={{
                              color: "#374151",
                            }}
                          >
                            {orgName}
                          </strong>
                          .
                        </p>

                        {/* Rating box */}

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
                                  padding:
                                    "20px 24px",
                                  textAlign: "center",
                                }}
                              >

                                <p
                                  style={{
                                    color: "#f59e0b",
                                    fontSize: "28px",
                                    margin:
                                      "0 0 6px",
                                    letterSpacing:
                                      "4px",
                                  }}
                                >
                                  {stars}
                                </p>

                                <p
                                  style={{
                                    color: primaryColor,
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    margin:
                                      "0 0 4px",
                                  }}
                                >
                                  {rating}/5
                                </p>

                                <p
                                  style={{
                                    color: "#9ca3af",
                                    fontSize: "13px",
                                    margin: 0,
                                  }}
                                >
                                  {ratingLabel}
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
                                  href={dashboardLink}
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
                                  View full review →
                                </a>

                              </td>
                            </tr>
                          </tbody>
                        </table>

                      </td>
                    </tr>

                    {/* ─────────────────────────
                        Footer
                    ───────────────────────── */}

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
                          }}
                        >
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

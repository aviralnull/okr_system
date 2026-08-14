
import * as React from "react";

interface Props {
  otp:      string;
  userName: string;
  expiresIn: string;
}

export function VerificationEmail({ otp, userName, expiresIn }: Props) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Your OKR Desk verification code</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f8f9fa", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#f8f9fa", padding: "40px 20px" }}>
          <tr>
            <td align="center">
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: "520px", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

                {/* Header */}
                <tr>
                  <td style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", padding: "32px 40px", textAlign: "center" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                      <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700" }}>O</span>
                    </div>
                    <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0 0 6px" }}>OKR Desk</h1>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0 }}>Goal tracking for modern teams</p>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: "36px 40px" }}>
                    <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: "600", margin: "0 0 8px" }}>Verify your email 📧</h2>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 28px", lineHeight: "1.6" }}>
                      Hi <strong style={{ color: "#374151" }}>{userName}</strong>, use the code below to verify your email.
                      It expires in <strong style={{ color: "#374151" }}>{expiresIn}</strong>.
                    </p>

                    {/* OTP box */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "28px" }}>
                      <tr>
                        <td align="center">
                          <div style={{ backgroundColor: "#f8f7ff", border: "2px solid #e0e7ff", borderRadius: "14px", padding: "28px 40px", display: "inline-block" }}>
                            <p style={{ color: "#6366f1", fontSize: "42px", fontWeight: "700", letterSpacing: "12px", margin: 0, fontFamily: "monospace" }}>
                              {otp}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style={{ color: "#9ca3af", fontSize: "12px", textAlign: "center", margin: "0 0 8px" }}>
                      Enter this code on the verification page.
                    </p>
                    <p style={{ color: "#d1d5db", fontSize: "12px", textAlign: "center", margin: 0 }}>
                      ⏰ Expires in <strong>{expiresIn}</strong>. Don't share this code with anyone.
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #f3f4f6" }}>
                    <p style={{ color: "#9ca3af", fontSize: "11px", textAlign: "center", margin: 0, lineHeight: "1.6" }}>
                      If you didn't request this, ignore this email.
                      <br />© {new Date().getFullYear()} OKR Desk. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

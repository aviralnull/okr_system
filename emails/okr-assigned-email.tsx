
// import * as React from "react";

// interface Props {
//   employeeName:  string;
//   assignerName:  string;
//   objectiveTitle: string;
//   quarter:       string;
//   dueDate:       string;
//   priority:      string;
//   dashboardLink: string;
// }

// export function OkrAssignedEmail({
//   employeeName, assignerName, objectiveTitle,
//   quarter, dueDate, priority, dashboardLink,
// }: Props) {
//   const priorityColor =
//     priority === "CRITICAL" ? "#ef4444" : priority === "HIGH" ? "#f59e0b" :
//     priority === "MEDIUM"   ? "#6366f1" : "#94a3b8";

//   return (
//     <html>
//       <head>
//         <meta charSet="utf-8" />
//         <title>New OKR assigned to you</title>
//       </head>
//       <body style={{ margin: 0, padding: 0, backgroundColor: "#f8f9fa", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
//         <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#f8f9fa", padding: "40px 20px" }}>
//           <tr>
//             <td align="center">
//               <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: "520px", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

//                 <tr>
//                   <td style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", padding: "32px 40px", textAlign: "center" }}>
//                     <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
//                       <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700" }}>O</span>
//                     </div>
//                     <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0 0 6px" }}>OKR Desk</h1>
//                     <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0 }}>Goal tracking for modern teams</p>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td style={{ padding: "36px 40px" }}>
//                     <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: "600", margin: "0 0 8px" }}>New objective assigned 🎯</h2>
//                     <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 24px", lineHeight: "1.6" }}>
//                       Hi <strong style={{ color: "#374151" }}>{employeeName}</strong>,{" "}
//                       <strong style={{ color: "#374151" }}>{assignerName}</strong> has assigned you a new objective for <strong style={{ color: "#374151" }}>{quarter}</strong>.
//                     </p>

//                     {/* OKR info box */}
//                     <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#f8f7ff", borderRadius: "10px", marginBottom: "28px", border: "1px solid #e0e7ff" }}>
//                       <tr>
//                         <td style={{ padding: "18px 22px" }}>
//                           <p style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>Objective</p>
//                           <p style={{ color: "#111827", fontSize: "15px", fontWeight: "600", margin: "0 0 16px", lineHeight: "1.4" }}>{objectiveTitle}</p>

//                           <table width="100%" cellPadding="0" cellSpacing="0">
//                             <tr>
//                               <td width="50%">
//                                 <p style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 4px" }}>Due date</p>
//                                 <p style={{ color: "#374151", fontSize: "13px", fontWeight: "500", margin: 0 }}>{dueDate}</p>
//                               </td>
//                               <td width="50%">
//                                 <p style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", margin: "0 0 4px" }}>Priority</p>
//                                 <p style={{ color: priorityColor, fontSize: "13px", fontWeight: "600", margin: 0 }}>{priority}</p>
//                               </td>
//                             </tr>
//                           </table>
//                         </td>
//                       </tr>
//                     </table>

//                     <table width="100%" cellPadding="0" cellSpacing="0">
//                       <tr>
//                         <td align="center">
//                           <a href={dashboardLink} style={{ display: "inline-block", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "15px", fontWeight: "600", textDecoration: "none", padding: "13px 32px", borderRadius: "10px" }}>
//                             View objective →
//                           </a>
//                         </td>
//                       </tr>
//                     </table>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td style={{ backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #f3f4f6" }}>
//                     <p style={{ color: "#9ca3af", fontSize: "11px", textAlign: "center", margin: 0 }}>
//                       © {new Date().getFullYear()} OKR Desk. All rights reserved.
//                     </p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//         </table>
//       </body>
//     </html>
//   );
// }






import * as React from "react";

interface Props {
  employeeName: string;
  assignerName: string;
  objectiveTitle: string;
  quarter: string;
  dueDate: string;
  priority: string;
  dashboardLink: string;

  // Organization branding
  orgName: string;
  orgLogo?: string | null;
  primaryColor?: string;
}

export function OkrAssignedEmail({
  employeeName,
  assignerName,
  objectiveTitle,
  quarter,
  dueDate,
  priority,
  dashboardLink,
  orgName,
  orgLogo,
  primaryColor = "#6366f1",
}: Props) {
  const priorityColor =
    priority === "CRITICAL"
      ? "#ef4444"
      : priority === "HIGH"
        ? "#f59e0b"
        : priority === "MEDIUM"
          ? primaryColor
          : "#94a3b8";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{`New objective assigned - ${orgName}`}</title>
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
                          }}
                        >
                          New objective assigned 🎯
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
                            {assignerName}
                          </strong>{" "}
                          has assigned you a new objective
                          for{" "}
                          <strong
                            style={{
                              color: "#374151",
                            }}
                          >
                            {quarter}
                          </strong>
                          .
                        </p>

                        {/* OKR info box */}

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
                                  padding: "18px 22px",
                                }}
                              >

                                <p
                                  style={{
                                    color: "#9ca3af",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    textTransform:
                                      "uppercase",
                                    letterSpacing:
                                      "0.05em",
                                    margin: "0 0 6px",
                                  }}
                                >
                                  Objective
                                </p>

                                <p
                                  style={{
                                    color: "#111827",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    margin:
                                      "0 0 16px",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {objectiveTitle}
                                </p>

                                <table
                                  width="100%"
                                  cellPadding="0"
                                  cellSpacing="0"
                                >
                                  <tbody>
                                    <tr>

                                      <td width="50%">
                                        <p
                                          style={{
                                            color:
                                              "#9ca3af",
                                            fontSize:
                                              "11px",
                                            fontWeight:
                                              "600",
                                            textTransform:
                                              "uppercase",
                                            margin:
                                              "0 0 4px",
                                          }}
                                        >
                                          Due date
                                        </p>

                                        <p
                                          style={{
                                            color:
                                              "#374151",
                                            fontSize:
                                              "13px",
                                            fontWeight:
                                              "500",
                                            margin: 0,
                                          }}
                                        >
                                          {dueDate}
                                        </p>
                                      </td>

                                      <td width="50%">
                                        <p
                                          style={{
                                            color:
                                              "#9ca3af",
                                            fontSize:
                                              "11px",
                                            fontWeight:
                                              "600",
                                            textTransform:
                                              "uppercase",
                                            margin:
                                              "0 0 4px",
                                          }}
                                        >
                                          Priority
                                        </p>

                                        <p
                                          style={{
                                            color:
                                              priorityColor,
                                            fontSize:
                                              "13px",
                                            fontWeight:
                                              "600",
                                            margin: 0,
                                          }}
                                        >
                                          {priority}
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
                                  View objective →
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
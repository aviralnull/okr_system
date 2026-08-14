
// Add to vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 9 * * 1-5" }] }
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { render }       from "@react-email/render";
import { transporter }  from "@/lib/mail";
import { canUseFeature } from "@/lib/plan-config";

export async function GET(req: Request) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now        = new Date();
    const threeDays  = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDays  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all orgs on Enterprise plan with automatedReminders
    const orgs = await prisma.organization.findMany({
      where: {
        subscriptions: { some: { plan: "ENTERPRISE", active: true } },
      },
      select: { id: true, name: true },
    });

    let remindersSent = 0;

    for (const org of orgs) {
      // 1. OKRs due in 3 days — at risk
      const dueSoon = await prisma.objective.findMany({
        where: {
          organizationId: org.id,
          status:  { in: ["AT_RISK", "BEHIND", "NOT_STARTED"] },
          dueDate: { gte: now, lte: threeDays },
        },
        include: { owner: { select: { name: true, email: true } } },
      });

      for (const obj of dueSoon) {
        // In-app notification
        await prisma.notification.create({
          data: {
            title:          "⚠️ OKR due in 3 days",
            message:        `"${obj.title}" is due soon and needs attention`,
            type:           "REMINDER",
            userId:         obj.ownerId,
            organizationId: org.id,
            link:           `/objectives/${obj.id}`,
          },
        }).catch(() => {});

        // Email reminder
        await transporter.sendMail({
          from:    `"OKR Desk" <${process.env.EMAIL_USER}>`,
          to:      obj.owner.email,
          subject: `⏰ OKR due in 3 days: ${obj.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#f59e0b">OKR Due Soon ⚠️</h2>
              <p>Hi ${obj.owner.name},</p>
              <p>Your OKR <strong>"${obj.title}"</strong> is due in 3 days and currently needs attention.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/objectives/${obj.id}"
                style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
                Update Progress
              </a>
            </div>
          `,
        }).catch(() => {});

        remindersSent++;
      }

      // 2. Weekly digest — progress reminders for stale OKRs (no update in 7 days)
      const staleOKRs = await prisma.objective.findMany({
        where: {
          organizationId: org.id,
          status:         { in: ["ON_TRACK", "AT_RISK", "NOT_STARTED"] },
          updatedAt:      { lte: sevenDays },
        },
        include: { owner: { select: { name: true, email: true, id: true } } },
        take:    50,
      });

      // Group by owner
      const byOwner = new Map<string, typeof staleOKRs>();
      for (const obj of staleOKRs) {
        const key = obj.ownerId;
        if (!byOwner.has(key)) byOwner.set(key, []);
        byOwner.get(key)!.push(obj);
      }

      for (const [, objs] of byOwner) {
        const owner = objs[0].owner;
        const list  = objs.map(o => `<li><strong>${o.title}</strong> — ${Math.round(o.progress)}%</li>`).join("");

        await transporter.sendMail({
          from:    `"OKR Desk" <${process.env.EMAIL_USER}>`,
          to:      owner.email,
          subject: `📊 Weekly OKR check-in — ${org.name}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#6366f1">Weekly OKR Check-in 📊</h2>
              <p>Hi ${owner.name}, here are your OKRs that haven't been updated recently:</p>
              <ul style="color:#374151">${list}</ul>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/objectives"
                style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
                Log Progress Now
              </a>
            </div>
          `,
        }).catch(() => {});

        remindersSent++;
      }
    }

    return NextResponse.json({ success: true, remindersSent });
  } catch (err) {
    console.error("Cron reminder error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}


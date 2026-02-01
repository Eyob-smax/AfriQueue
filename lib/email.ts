/**
 * Email sending via Nodemailer (SMTP). Free to use with any SMTP provider
 * (Gmail, Outlook, Mailtrap, SendGrid SMTP, etc.).
 *
 * Env vars (all optional; if SMTP_HOST is not set, emails are no-op):
 *   SMTP_HOST       - e.g. smtp.gmail.com
 *   SMTP_PORT       - e.g. 587 (default 587)
 *   SMTP_SECURE     - "true" for 465 (default false)
 *   SMTP_USER       - auth username
 *   SMTP_PASS       - auth password
 *   SMTP_FROM       - From address, e.g. "Africare <noreply@yourdomain.com>"
 */

const FROM = process.env.SMTP_FROM ?? "Africare <noreply@localhost>";

function getTransporter(): import("nodemailer").Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require("nodemailer") as typeof import("nodemailer");
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === "true";
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    return transporter;
  } catch {
    return null;
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
  } catch {
    // Silently ignore send failures (network, invalid credentials, etc.)
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendStaffRegistrationToAdmins(
  adminEmails: string[],
  staffName: string,
  staffEmail: string,
  healthCenterName: string
): Promise<void> {
  const subject = "New staff registration pending approval";
  const html = `
    <p>A new staff registration is waiting for approval.</p>
    <p><strong>Name:</strong> ${escapeHtml(staffName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(staffEmail)}</p>
    <p><strong>Health center:</strong> ${escapeHtml(healthCenterName || "—")}</p>
    <p><a href="${APP_URL}/dashboard/admin/staff-registrations">Review in dashboard</a></p>
  `;
  for (const email of adminEmails) {
    await sendEmail(email, subject, html);
  }
}

export async function sendStaffApproved(staffEmail: string, staffName: string): Promise<void> {
  const subject = "Your staff account has been approved";
  const html = `
    <p>Hi ${escapeHtml(staffName)},</p>
    <p>Your staff registration has been approved. You can now sign in to the dashboard.</p>
    <p><a href="${APP_URL}/auth/login">Sign in</a></p>
  `;
  await sendEmail(staffEmail, subject, html);
}

export async function sendStaffRejected(staffEmail: string, staffName: string): Promise<void> {
  const subject = "Staff registration update";
  const html = `
    <p>Hi ${escapeHtml(staffName)},</p>
    <p>Unfortunately your staff registration could not be approved at this time. If you have questions, please contact support.</p>
    <p><a href="${APP_URL}/auth/login">Back to login</a></p>
  `;
  await sendEmail(staffEmail, subject, html);
}

export async function sendAccountBlockedOrActivated(
  userEmail: string,
  userName: string,
  status: "blocked" | "activated"
): Promise<void> {
  const subject = status === "blocked" ? "Your account has been suspended" : "Your account has been reactivated";
  const html =
    status === "blocked"
      ? `
    <p>Hi ${escapeHtml(userName)},</p>
    <p>Your account has been suspended. You will not be able to sign in until an administrator reactivates your account.</p>
    <p>If you believe this is an error, please contact support.</p>
  `
      : `
    <p>Hi ${escapeHtml(userName)},</p>
    <p>Your account has been reactivated. You can sign in again.</p>
    <p><a href="${APP_URL}/auth/login">Sign in</a></p>
  `;
  await sendEmail(userEmail, subject, html);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

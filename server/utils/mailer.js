/**
 * mailer.js — one sendEmail() that works both locally and deployed.
 *
 * Transport is chosen automatically from environment variables:
 *
 *   1. RESEND_API_KEY set  -> Resend HTTPS API (port 443).
 *      Use this on Render (free web services block SMTP ports
 *      25/465/587) and it also works fine on localhost.
 *   2. else GAS_MAIL_URL set -> Google Apps Script relay (HTTPS). Sends
 *      from YOUR Gmail account, so no custom domain is needed.
 *   3. else SMTP_HOST set  -> SMTP via nodemailer.
 *      Handy on localhost (e.g. Gmail app password) or on a Render
 *      paid instance. nodemailer is only loaded when this path is
 *      used, so you don't need it installed for the Resend path.
 *   4. none set            -> throws a clear configuration error.
 *
 * Usage:
 *   await sendEmail({
 *     to, subject, text,
 *     attachments: [{ filename, content: <Buffer> }],
 *   });
 */

let smtpTransporter = null;

function getSmtpTransporter() {
  if (!smtpTransporter) {
    // Lazy require: only needed for the SMTP path.
    const nodemailer = require("nodemailer");
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true", // true for port 465
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return smtpTransporter;
}

// MAIL_FROM is preferred; SMTP_FROM kept as a fallback for older setups.
const getFrom = () => process.env.MAIL_FROM || process.env.SMTP_FROM;

async function sendViaResend({ to, subject, text, attachments = [] }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFrom(),
      to: [to],
      subject,
      text,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content)
          ? a.content.toString("base64")
          : a.content,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email provider error (${res.status}): ${body}`);
  }
  return res.json();
}

const MIME = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Google Apps Script relay — see the setup steps: deploy the script as
// a Web App and set GAS_MAIL_URL + GAS_MAIL_SECRET. The email is sent
// from the Gmail account that owns the script.
async function sendViaAppsScript({ to, subject, text, attachments = [] }) {
  const res = await fetch(process.env.GAS_MAIL_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    redirect: "follow",
    body: JSON.stringify({
      secret: process.env.GAS_MAIL_SECRET,
      to,
      subject,
      text,
      fromName: process.env.MAIL_FROM_NAME || "",
      attachments: attachments.map((a) => {
        const ext = (a.filename.match(/\.[a-zA-Z0-9]+$/) || [
          "",
        ])[0].toLowerCase();
        return {
          filename: a.filename,
          mimeType: MIME[ext] || "application/octet-stream",
          content: Buffer.isBuffer(a.content)
            ? a.content.toString("base64")
            : a.content,
        };
      }),
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.ok) {
    throw new Error(
      `Apps Script mail error: ${(data && data.error) || res.status}`,
    );
  }
  return data;
}

async function sendViaSmtp({ to, subject, text, attachments = [] }) {
  return getSmtpTransporter().sendMail({
    from: getFrom(),
    to,
    subject,
    text,
    attachments,
  });
}

async function sendEmail(options) {
  if (process.env.GAS_MAIL_URL && !process.env.RESEND_API_KEY) {
    return sendViaAppsScript(options);
  }
  if (!getFrom()) {
    throw new Error(
      "Email is not configured: set MAIL_FROM in the environment.",
    );
  }
  if (process.env.RESEND_API_KEY) return sendViaResend(options);
  if (process.env.SMTP_HOST) return sendViaSmtp(options);
  throw new Error(
    "Email is not configured: set RESEND_API_KEY, GAS_MAIL_URL, or SMTP_HOST.",
  );
}

module.exports = { sendEmail };

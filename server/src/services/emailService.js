const nodemailer = require('nodemailer');

/**
 * Creates a transporter using Gmail App Password.
 * IMPORTANT: EMAIL_PASSWORD must be a 16-character Gmail App Password,
 * NOT your regular Gmail password.
 * Get one at: https://myaccount.google.com/apppasswords
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends a teacher invitation email.
 * The teacher accepts by clicking the link and signing in with Google — 
 * no password required, matching the app's Google OAuth flow.
 */
async function sendTeacherInvitation({ email, firstName, lastName, invitationLink, expiresAt }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('[emailService] EMAIL_USER / EMAIL_PASSWORD not configured — skipping email.');
    return { success: false, error: 'Email not configured' };
  }

  const expiryDate = new Date(expiresAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const transporter = createTransporter();

    // Verify connection before sending
    await transporter.verify();

    await transporter.sendMail({
      from: `"LMS Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎓 You're invited to join EduLMS as a Teacher`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teacher Invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 48px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🎓</div>
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">EduLMS</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Learning Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <h2 style="color:#111827;margin:0 0 8px;font-size:22px;font-weight:700;">
                Hello, ${firstName}! 👋
              </h2>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                You have been personally invited by the admin to join <strong style="color:#4f46e5;">EduLMS</strong> as a <strong>Teacher</strong>. 
                We're excited to have you on board!
              </p>

              <!-- Info Box -->
              <div style="background:#f5f3ff;border-left:4px solid #4f46e5;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
                <p style="color:#374151;font-size:14px;margin:0 0 8px;"><strong>Your account details:</strong></p>
                <p style="color:#6b7280;font-size:14px;margin:4px 0;">📧 Email: <strong style="color:#374151;">${email}</strong></p>
                <p style="color:#6b7280;font-size:14px;margin:4px 0;">👤 Name: <strong style="color:#374151;">${firstName} ${lastName}</strong></p>
                <p style="color:#6b7280;font-size:14px;margin:4px 0;">🎯 Role: <strong style="color:#4f46e5;">Teacher</strong></p>
              </div>

              <!-- How it works -->
              <div style="margin-bottom:32px;">
                <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;">How to accept your invitation:</p>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;font-size:13px;color:#6b7280;">
                    <span style="color:#4f46e5;font-weight:700;">1.</span> Click the button below
                  </div>
                  <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;font-size:13px;color:#6b7280;margin-top:6px;">
                    <span style="color:#4f46e5;font-weight:700;">2.</span> Sign in with your Google account (<strong>${email}</strong>)
                  </div>
                  <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;font-size:13px;color:#6b7280;margin-top:6px;">
                    <span style="color:#4f46e5;font-weight:700;">3.</span> You'll be automatically added as a Teacher ✅
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${invitationLink}" 
                   style="display:inline-block;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 15px rgba(79,70,229,0.4);">
                  Accept Invitation →
                </a>
              </div>

              <!-- Expiry Warning -->
              <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;text-align:center;margin-bottom:24px;">
                <p style="color:#92400e;font-size:13px;margin:0;">
                  ⏰ This invitation expires on <strong>${expiryDate}</strong>
                </p>
              </div>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

              <!-- Footer note -->
              <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
                If you cannot click the button above, copy and paste this URL into your browser:<br>
                <span style="color:#4f46e5;word-break:break-all;">${invitationLink}</span>
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:12px 0 0;">
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 48px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} EduLMS • Sent by Admin
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `Hello ${firstName} ${lastName},\n\nYou have been invited to join EduLMS as a Teacher.\n\nAccept your invitation here: ${invitationLink}\n\nThis invitation expires on ${expiryDate}.\n\nIf you didn't expect this, ignore this email.`,
    });

    console.log(`[emailService] ✅ Invitation email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('[emailService] ❌ Failed to send teacher invitation:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendTeacherInvitation };

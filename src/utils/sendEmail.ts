import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendVerificationEmail = async (
  email: string,
  token: string,
  link?: string,
  type: "verify" | "reset" = "verify"
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  const url = link || `${process.env.CLIENT_URL?.replace(/\/$/, '')}/${type === "verify" ? "verify-email" : "reset-password"
    }?token=${token}`;

  const title = type === "verify" ? "Xác minh tài khoản" : "Đặt lại mật khẩu";
  const message = type === "verify"
    ? "Cảm ơn bạn đã đăng ký HTMovie! Vui lòng xác minh email để bắt đầu trải nghiệm xem phim không giới hạn."
    : "Chúng tôi nhận được yêu cầu khôi phục mật khẩu. Nếu không phải bạn, hãy bỏ qua email này.";

  const buttonText = type === "verify" ? "XÁC MINH NGAY" : "ĐẶT LẠI MẬT KHẨU";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 40px 0;">
            
            <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <tr>
                <td align="center" style="background-color: #4f46e5; padding: 30px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">🎬 HTMovie</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin-top: 0; font-size: 22px;">Xin chào,</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    ${message}
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.4);">
                      ${buttonText}
                    </a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                    Hoặc copy đường dẫn này vào trình duyệt:
                  </p>
                  <p style="background-color: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; overflow-wrap: break-word; font-size: 12px; color: #4f46e5;">
                    <a href="${url}" style="color: #4f46e5; text-decoration: none;">${url}</a>
                  </p>
                  
                  <p style="color: #9ca3af; font-size: 13px; margin-top: 30px; font-style: italic;">
                    Link này có hiệu lực trong vòng 15 phút.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} HTMovie App. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
              Đây là email tự động, vui lòng không trả lời.
            </p>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"HTMovie Support" <no-reply@htmovie.com>',
      to: email,
      subject: type === "verify" ? "✅ Xác minh tài khoản" : "🔐 Đặt lại mật khẩu",
      html: htmlContent,
    });
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};
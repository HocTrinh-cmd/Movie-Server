import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (
  email: string,
  token: string,
  link?: string,
  type: "verify" | "reset" = "verify"
) => {
  const url =
    link ||
    `${process.env.CLIENT_URL?.replace(/\/$/, '')}/${
      type === "verify" ? "verify-email" : "reset-password"
    }?token=${token}`;

  const title = type === "verify" ? "🎬 Xác minh tài khoản" : "🔐 Đặt lại mật khẩu";

  const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333;">${title}</h2>
          <p>Bấm vào nút dưới đây để tiếp tục:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            CLICK HERE
          </a>
        </div>
      </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: 'httmailer1@gmail.com',                     
      subject: title,
      html: htmlContent,
    });
    console.log("✅ Resend success:", data);
  } catch (error) {
    console.error("❌ Resend failed:", error);
  }
};
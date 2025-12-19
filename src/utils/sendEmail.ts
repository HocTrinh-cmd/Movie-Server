import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendVerificationEmail = async (
  email: string,
  token: string,
  link?: string,
  type: "verify" | "reset" = "verify"
) => {
  // 1. Cấu hình chuẩn cho Gmail SMTP (Ổn định hơn service: 'gmail')
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,              // Port 587 là chuẩn nhất cho TLS, port 465 (SSL)
    secure: true,          // false đối với port 587, true khi dùng port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Bắt buộc phải là MẬT KHẨU ỨNG DỤNG (16 ký tự)
    },
    tls: {
      rejectUnauthorized: false // Giúp tránh lỗi chứng chỉ SSL trên server Render
    }
  });

  const url =
    link ||
    `${process.env.CLIENT_URL?.replace(/\/$/, '')}/${type === "verify" ? "verify-email" : "reset-password"
    }?token=${token}`;

  const title =
    type === "verify"
      ? "🎬 Xác minh tài khoản Movie App"
      : "🔐 Yêu cầu đặt lại mật khẩu";

  const buttonText =
    type === "verify" ? "✅ Xác minh tài khoản" : "🔁 Đặt lại mật khẩu";

  const introText =
    type === "verify"
      ? "Cảm ơn bạn đã đăng ký. Vui lòng xác minh tài khoản của bạn bằng cách nhấn vào nút bên dưới:"
      : "Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút dưới đây để tiếp tục:";

  const footerText =
    type === "verify"
      ? "Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này."
      : "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.";

  // 2. LOGIC GỬI EMAIL (QUAN TRỌNG NHẤT)
  const mailOptions = {
    from: `"🎬 Movie App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">${title}</h2>
          <p style="font-size: 16px; color: #555;">${introText}</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            ${buttonText}
          </a>
          <p style="margin-top: 20px; font-size: 14px; color: #888;">
            ${footerText}
          </p>
        </div>
      </div>
    `,
  };

  // 🚀 KỸ THUẬT FIRE-AND-FORGET:
  // Không dùng 'await' ở đây. Server sẽ không đợi email gửi xong mà chạy tiếp luôn.
  // Email sẽ tự chạy ngầm bên dưới.
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Lỗi gửi email ngầm:", error);
    } else {
      console.log("✅ Email đã gửi ngầm thành công:", info.response);
    }
  });
};
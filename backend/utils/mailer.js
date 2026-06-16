import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password
    },
});

export const sendOrderConfirmationEmail = async (toEmail, customerName, order) => {
    try {
        const itemsHTML = Array.isArray(order.items)
            ? order.items.map(item => `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">×${item.quantity}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">ETB ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>`).join("")
            : "";

        await transporter.sendMail({
            from: `"Marqato" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Order Confirmed — #${order.id}`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8f7f4;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e3de;">
    <div style="background:#4F46E5;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Marqato</h1>
      <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px;">Your order is confirmed ✓</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#1a1a1a;">Hi <strong>${customerName}</strong>,</p>
      <p style="margin:0 0 24px;color:#64748b;">Thank you for your order! We're preparing it now and will keep you updated.</p>

      <div style="background:#f8f7f4;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Order ID</p>
        <p style="margin:0;font-family:monospace;font-size:15px;font-weight:600;color:#1a1a1a;">${order.id}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="text-align:left;">
            <th style="font-size:12px;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;">Item</th>
            <th style="font-size:12px;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;text-align:center;">Qty</th>
            <th style="font-size:12px;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <div style="border-top:2px solid #e5e3de;padding-top:16px;display:flex;justify-content:space-between;">
        <span style="font-weight:700;color:#1a1a1a;">Total</span>
        <span style="font-weight:700;font-family:monospace;color:#4F46E5;">ETB ${order.amount?.toLocaleString()}</span>
      </div>

      <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
        <p style="margin:0;color:#166534;font-size:13px;">Payment: <strong>${order.paymentMethod}</strong>${order.payment ? " ✓ Paid" : " — Pay on delivery"}</p>
      </div>

      <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;text-align:center;">
        Questions? Reply to this email or contact us at ${process.env.EMAIL_USER}
      </p>
    </div>
  </div>
</body>
</html>`,
        });
        console.log(`Order confirmation email sent to ${toEmail}`);
    } catch (error) {
        // Don't fail the order if email fails
        console.error("Email send failed:", error.message);
    }
};

export const sendContactEmail = async (senderName, senderEmail, message) => {
    try {
        await transporter.sendMail({
            from: `"Marqato Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: senderEmail,
            subject: `New message from ${senderName} — Marqato`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8f7f4;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e3de;">
    <div style="background:#4F46E5;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Marqato</h1>
      <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px;">New contact form message</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">From</p>
      <p style="margin:0 0 4px;font-weight:600;color:#1a1a1a;">${senderName}</p>
      <p style="margin:0 0 24px;color:#64748b;font-size:13px;">${senderEmail}</p>
      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Message</p>
      <div style="background:#f8f7f4;border-radius:12px;padding:20px;">
        <p style="margin:0;color:#1a1a1a;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
      </div>
      <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">Reply directly to this email to respond to ${senderName}.</p>
    </div>
  </div>
</body>
</html>`,
        });

        // Send auto-reply to the user
        await transporter.sendMail({
            from: `"Marqato" <${process.env.EMAIL_USER}>`,
            to: senderEmail,
            subject: `We got your message — Marqato`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8f7f4;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e3de;">
    <div style="background:#4F46E5;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Marqato</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#1a1a1a;">Hi <strong>${senderName}</strong>,</p>
      <p style="margin:0 0 24px;color:#64748b;">Thanks for reaching out! We've received your message and will get back to you within 24 hours.</p>
      <div style="background:#f8f7f4;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;">Your message</p>
        <p style="margin:0;color:#1a1a1a;font-size:13px;white-space:pre-wrap;">${message}</p>
      </div>
      <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">Marqato — Merkato, Addis Ababa</p>
    </div>
  </div>
</body>
</html>`,
        });

        console.log(`Contact email received from ${senderEmail}`);
    } catch (error) {
        console.error("Contact email failed:", error.message);
        throw error;
    }
};

export const sendStatusUpdateEmail = async (toEmail, customerName, orderId, status) => {
    try {
        await transporter.sendMail({
            from: `"Marqato" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Your order has been ${status} — Marqato`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8f7f4;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e3de;overflow:hidden;">
    <div style="background:#4F46E5;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:24px;">Marqato</h1>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your order <strong style="font-family:monospace;">${orderId}</strong> status has been updated to:</p>
      <div style="background:#f8f7f4;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <span style="font-size:22px;font-weight:700;color:#4F46E5;">${status}</span>
      </div>
      <p style="color:#64748b;font-size:13px;">Thank you for shopping with Marqato!</p>
    </div>
  </div>
</body>
</html>`,
        });
    } catch (error) {
        console.error("Status email failed:", error.message);
    }
};

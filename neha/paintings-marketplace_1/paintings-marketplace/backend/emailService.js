// emailService.js
// Sends the customer an order confirmation email via Resend
// (https://resend.com). Resend lets you send from their shared
// "onboarding@resend.dev" address with zero setup — good enough to go
// live immediately. Later, verifying your own domain in the Resend
// dashboard lets you send from your own address instead (see README).
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const STORE_NAME = process.env.STORE_NAME || "Gallery & Co.";

export async function sendOrderConfirmationEmail({ to, orderId, items, total, paymentMethod }) {
  if (!RESEND_API_KEY) {
    // Not configured yet — don't crash the order, just skip the email
    // and say so in the server log so it's obvious why no email arrived.
    console.warn(`RESEND_API_KEY not set — skipped confirmation email for order #${orderId}.`);
    return;
  }

  const itemsHtml = items
    .map(
      (i) =>
        `<li>${i.title} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}</li>`
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Thank you for your order!</h2>
      <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
      <ul style="padding-left: 20px;">${itemsHtml}</ul>
      <p style="font-size: 18px;"><strong>Total: ₹${total.toLocaleString("en-IN")}</strong></p>
      <p>Payment method: ${paymentMethod}</p>
      <p>We'll be in touch shortly about shipping. Thank you for supporting original art!</p>
      <p style="color: #888; font-size: 13px;">— ${STORE_NAME}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${STORE_NAME} <${FROM_EMAIL}>`,
        to,
        subject: `Order Confirmation #${orderId} — ${STORE_NAME}`,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend email failed:", errorText);
    }
  } catch (err) {
    // A failed email should never take down or roll back a real order —
    // the order already succeeded. Just log it so you can investigate.
    console.error("Error sending confirmation email:", err.message);
  }
}

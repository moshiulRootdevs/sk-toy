const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || '"SK TOY" <noreply@sktoy.com.bd>';
const STORE_URL = process.env.CLIENT_URL || 'http://localhost:3000';

function fmtTk(n) {
  return '৳' + Number(n || 0).toLocaleString('en-BD');
}

function orderInvoiceHtml(order) {
  const itemsRows = (order.lines || []).map(l => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0E8D8;font-size:14px;color:#1F2F4A;">
        ${l.name}${l.variant ? ` <span style="color:#7A8299;font-size:12px;">(${l.variant})</span>` : ''}
        ${l.sku ? `<br><span style="color:#A89E92;font-size:11px;font-family:monospace;">SKU: ${l.sku}</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F0E8D8;text-align:center;font-size:14px;color:#5A5048;">${l.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F0E8D8;text-align:right;font-size:14px;color:#1F2F4A;">${fmtTk(l.price)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F0E8D8;text-align:right;font-size:14px;font-weight:600;color:#1F2F4A;">${fmtTk(l.price * l.qty)}</td>
    </tr>`).join('');

  const placedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const paymentLabel = { cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad', card: 'Card' }[order.paymentMethod] || order.paymentMethod;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Order Confirmation – ${order.orderNo}</title>
</head>
<body style="margin:0;padding:0;background:#F5EFE4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE4;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- Header -->
    <tr>
      <td style="background:#1F2F4A;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
        <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;color:#FFFBF2;">
          <span style="color:#EC5D4A;">S</span><span style="color:#F5C443;">K</span
          ><span style="color:#F5C443;">·</span
          ><span style="color:#F39436;">T</span><span style="color:#4FA36A;">O</span><span style="color:#6FB8D9;">Y</span>
        </div>
        <p style="margin:6px 0 0;color:#FFFBF2;opacity:.7;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Bangladesh's Favourite Toy Store</p>
      </td>
    </tr>

    <!-- Green tick banner -->
    <tr>
      <td style="background:#FFFBF2;padding:32px 40px 24px;text-align:center;border-left:1px solid #E6D9BD;border-right:1px solid #E6D9BD;">
        <div style="width:56px;height:56px;border-radius:50%;background:#D6F0DE;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D8A4E" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1F2F4A;">Order Confirmed!</h1>
        <p style="margin:0;color:#5A5048;font-size:14px;">Thank you, ${order.customerName}. Your order has been received and is being processed.</p>
        <div style="margin-top:16px;display:inline-block;background:#FFF4EC;border:1.5px solid #F5C443;border-radius:8px;padding:8px 20px;">
          <span style="font-family:monospace;font-size:18px;font-weight:700;color:#EC5D4A;letter-spacing:.05em;">#${order.orderNo}</span>
        </div>
      </td>
    </tr>

    <!-- Order meta row -->
    <tr>
      <td style="background:#FBF4E8;border-left:1px solid #E6D9BD;border-right:1px solid #E6D9BD;padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #E6D9BD;font-size:12px;color:#7A8299;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;">Order Date</td>
            <td style="padding:16px 0;border-bottom:1px solid #E6D9BD;font-size:13px;color:#1F2F4A;text-align:right;">${placedAt}</td>
          </tr>
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #E6D9BD;font-size:12px;color:#7A8299;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;">Payment</td>
            <td style="padding:16px 0;border-bottom:1px solid #E6D9BD;font-size:13px;color:#1F2F4A;text-align:right;">${paymentLabel}</td>
          </tr>
          <tr>
            <td style="padding:16px 0;font-size:12px;color:#7A8299;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;">Deliver To</td>
            <td style="padding:16px 0;font-size:13px;color:#1F2F4A;text-align:right;">${order.address}${order.area ? ', ' + order.area : ''}${order.district ? ', ' + order.district : ''}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Items -->
    <tr>
      <td style="background:#FFFBF2;border-left:1px solid #E6D9BD;border-right:1px solid #E6D9BD;padding:24px 40px 0;">
        <h3 style="margin:0 0 16px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#7A8299;font-family:monospace;">Items Ordered</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="border-bottom:2px solid #E6D9BD;">
              <th style="text-align:left;font-size:11px;color:#A89E92;padding-bottom:8px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">Product</th>
              <th style="text-align:center;font-size:11px;color:#A89E92;padding-bottom:8px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">Qty</th>
              <th style="text-align:right;font-size:11px;color:#A89E92;padding-bottom:8px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">Unit</th>
              <th style="text-align:right;font-size:11px;color:#A89E92;padding-bottom:8px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </td>
    </tr>

    <!-- Totals -->
    <tr>
      <td style="background:#FFFBF2;border-left:1px solid #E6D9BD;border-right:1px solid #E6D9BD;padding:16px 40px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#7A8299;padding:4px 0;">Subtotal</td>
            <td style="font-size:13px;color:#1F2F4A;text-align:right;padding:4px 0;">${fmtTk(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#7A8299;padding:4px 0;">Shipping</td>
            <td style="font-size:13px;color:#1F2F4A;text-align:right;padding:4px 0;">${order.shipping === 0 ? '<span style="color:#2D8A4E;">Free</span>' : fmtTk(order.shipping)}</td>
          </tr>
          ${order.discount > 0 ? `<tr>
            <td style="font-size:13px;color:#2D8A4E;padding:4px 0;">Discount</td>
            <td style="font-size:13px;color:#2D8A4E;text-align:right;padding:4px 0;">-${fmtTk(order.discount)}</td>
          </tr>` : ''}
          ${order.giftWrapCost > 0 ? `<tr>
            <td style="font-size:13px;color:#7A8299;padding:4px 0;">Gift Wrap</td>
            <td style="font-size:13px;color:#1F2F4A;text-align:right;padding:4px 0;">${fmtTk(order.giftWrapCost)}</td>
          </tr>` : ''}
          <tr>
            <td colspan="2" style="padding:8px 0 0;"><div style="border-top:2px solid #E6D9BD;"></div></td>
          </tr>
          <tr>
            <td style="font-size:16px;font-weight:700;color:#1F2F4A;padding-top:8px;">Total</td>
            <td style="font-size:16px;font-weight:700;color:#EC5D4A;text-align:right;padding-top:8px;">${fmtTk(order.total)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background:#FFFBF2;border-left:1px solid #E6D9BD;border-right:1px solid #E6D9BD;padding:8px 40px 32px;text-align:center;">
        <a href="${STORE_URL}/order/${order.orderNo}"
           style="display:inline-block;background:#EC5D4A;color:#FFFBF2;font-size:14px;font-weight:600;padding:12px 32px;border-radius:999px;text-decoration:none;margin-right:12px;">
          View Order
        </a>
        <a href="${STORE_URL}/track"
           style="display:inline-block;background:#1F2F4A;color:#FFFBF2;font-size:14px;font-weight:600;padding:12px 32px;border-radius:999px;text-decoration:none;">
          Track Order
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#1F2F4A;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
        <p style="margin:0 0 6px;color:#FFFBF2;font-size:13px;">Questions? Reply to this email or contact us at</p>
        <a href="mailto:support@sktoy.com.bd" style="color:#F5C443;font-size:13px;text-decoration:none;">support@sktoy.com.bd</a>
        <p style="margin:16px 0 0;color:#FFFBF2;opacity:.4;font-size:11px;">© ${new Date().getFullYear()} SK TOY · Dhaka, Bangladesh</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendOrderConfirmation(order) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[mailer] SMTP not configured — skipping order confirmation email');
    return;
  }
  if (!order.customerEmail) {
    console.log('[mailer] No customer email on order', order.orderNo, '— skipping');
    return;
  }
  try {
    await transporter.sendMail({
      from:    FROM,
      to:      order.customerEmail,
      subject: `Order Confirmed: #${order.orderNo} – SK TOY`,
      html:    orderInvoiceHtml(order),
    });
    console.log('[mailer] Invoice sent to', order.customerEmail, 'for order', order.orderNo);
  } catch (err) {
    console.error('[mailer] Failed to send order confirmation:', err.message);
  }
}

module.exports = { sendOrderConfirmation };

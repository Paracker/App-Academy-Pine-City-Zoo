import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Skip sending in development if SMTP is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email would be sent (SMTP not configured):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const info = await transporter.sendMail({
      from: `"Innovating Tech Solutions" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderNumber: string, total: number, items: any[]) => ({
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed!</h1>
        <p>Thank you for your order. Your order number is <strong>${orderNumber}</strong>.</p>
        
        <h2>Order Details:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.product?.name || 'Product'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">R${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; font-size: 18px; font-weight: bold;">Total: R${total.toFixed(2)}</p>
        </div>
        
        <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Innovating Tech Solutions<br>
          Alberton, Gauteng<br>
          <a href="mailto:support@innovatingtech.co.za">support@innovatingtech.co.za</a>
        </p>
      </div>
    `,
    text: `Order Confirmed! Your order number is ${orderNumber}. Total: R${total.toFixed(2)}`,
  }),

  bookingConfirmation: (serviceName: string, scheduledDate: Date, location: string, totalPrice: number) => ({
    subject: `Booking Confirmed - ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Booking Confirmed!</h1>
        <p>Your service booking has been confirmed.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Service Details:</h2>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Date & Time:</strong> ${scheduledDate.toLocaleString()}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Price:</strong> R${totalPrice.toFixed(2)}</p>
        </div>
        
        <p>Our technician will arrive at the scheduled time. Please ensure someone is available at the location.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Innovating Tech Solutions<br>
          Alberton, Gauteng<br>
          <a href="mailto:support@innovatingtech.co.za">support@innovatingtech.co.za</a>
        </p>
      </div>
    `,
    text: `Booking Confirmed! Service: ${serviceName}, Date: ${scheduledDate.toLocaleString()}, Location: ${location}, Price: R${totalPrice.toFixed(2)}`,
  }),

  orderStatusUpdate: (orderNumber: string, status: string, notes?: string) => ({
    subject: `Order Update - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Status Update</h1>
        <p>Your order <strong>${orderNumber}</strong> has been updated.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;"><strong>New Status:</strong> ${status}</p>
          ${notes ? `<p style="margin-top: 10px;">${notes}</p>` : ''}
        </div>
        
        <p>You can track your order status in your dashboard.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Innovating Tech Solutions<br>
          Alberton, Gauteng<br>
          <a href="mailto:support@innovatingtech.co.za">support@innovatingtech.co.za</a>
        </p>
      </div>
    `,
    text: `Order ${orderNumber} status updated to: ${status}${notes ? `. ${notes}` : ''}`,
  }),

  bookingReminder: (serviceName: string, scheduledDate: Date, location: string) => ({
    subject: `Reminder: Upcoming Service - ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Service Reminder</h1>
        <p>This is a reminder about your upcoming service appointment.</p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h2 style="margin-top: 0;">Appointment Details:</h2>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Date & Time:</strong> ${scheduledDate.toLocaleString()}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        
        <p>Please ensure someone is available at the location at the scheduled time.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Innovating Tech Solutions<br>
          Alberton, Gauteng<br>
          <a href="mailto:support@innovatingtech.co.za">support@innovatingtech.co.za</a>
        </p>
      </div>
    `,
    text: `Reminder: ${serviceName} scheduled for ${scheduledDate.toLocaleString()} at ${location}`,
  }),

  lowStockAlert: (productName: string, currentStock: number, threshold: number) => ({
    subject: `Low Stock Alert - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Low Stock Alert</h1>
        <p>The following product is running low on stock:</p>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Product:</strong> ${productName}</p>
          <p><strong>Current Stock:</strong> ${currentStock} units</p>
          <p><strong>Threshold:</strong> ${threshold} units</p>
        </div>
        
        <p>Please restock this product soon to avoid running out.</p>
      </div>
    `,
    text: `Low Stock Alert: ${productName} has ${currentStock} units remaining (threshold: ${threshold})`,
  }),
};


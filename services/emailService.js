const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to AgriLink Lanka!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center;">
          <h1>🌱 Welcome to AgriLink Lanka!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName}!</h2>
          <p>Thank you for joining AgriLink Lanka, Sri Lanka's premier vegetable export platform.</p>
          
          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
            <h3>Your Account Details:</h3>
            <p><strong>Name:</strong> ${user.fullName}</p>
            <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p><strong>Email:</strong> ${user.email}</p>
          </div>

          <p>As a ${user.role}, you can now:</p>
          <ul>
            ${this.getRoleSpecificFeatures(user.role)}
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>

          <p>If you have any questions, feel free to contact our support team.</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send email verification
  async sendVerificationEmail(user, verificationToken) {
    const subject = 'Verify Your Email - AgriLink Lanka';
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center;">
          <h1>✅ Verify Your Email</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName}!</h2>
          <p>Please verify your email address to complete your registration on AgriLink Lanka.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>

          <p>This link will expire in 24 hours.</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Reset Your Password - AgriLink Lanka';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff9800, #f57c00); color: white; padding: 20px; text-align: center;">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName}!</h2>
          <p>You requested a password reset for your AgriLink Lanka account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>

          <p>This link will expire in 1 hour.</p>
          
          <p>If you didn't request this reset, please ignore this email.</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send order confirmation email
  async sendOrderConfirmation(order, buyer, farmer) {
    const subject = `Order Confirmed - ${order.orderNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center;">
          <h1>✅ Order Confirmed</h1>
          <h2>Order #${order.orderNumber}</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${buyer.firstName}!</h2>
          <p>Your order has been confirmed and is being processed.</p>
          
          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total Amount:</strong> ${order.orderDetails.currency} ${order.orderDetails.finalAmount}</p>
            <p><strong>Order Type:</strong> ${order.orderType}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Farmer Details:</h3>
            <p><strong>Name:</strong> ${farmer.fullName}</p>
            <p><strong>Phone:</strong> ${farmer.phone}</p>
            <p><strong>Location:</strong> ${farmer.address?.district || 'N/A'}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p>We'll keep you updated on your order status.</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(buyer.email, subject, html);
  }

  // Send order status update email
  async sendOrderStatusUpdate(order, user, newStatus) {
    const subject = `Order Status Updated - ${order.orderNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 20px; text-align: center;">
          <h1>📦 Order Status Update</h1>
          <h2>Order #${order.orderNumber}</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName}!</h2>
          <p>Your order status has been updated.</p>
          
          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2196F3;">
            <h3>New Status: ${newStatus.toUpperCase()}</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Previous Status:</strong> ${order.status}</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p>Thank you for choosing AgriLink Lanka!</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send exporter approval email
  async sendExporterApproval(user, isApproved) {
    const subject = isApproved ? 'Exporter Account Approved!' : 'Exporter Account Update';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${isApproved ? '#4CAF50' : '#ff9800'}, ${isApproved ? '#45a049' : '#f57c00'}); color: white; padding: 20px; text-align: center;">
          <h1>${isApproved ? '✅ Approved!' : '⚠️ Account Update'}</h1>
          <h2>Exporter Account Status</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName}!</h2>
          
          ${isApproved ? `
            <p>🎉 Congratulations! Your exporter account has been approved by our admin team.</p>
            <p>You can now:</p>
            <ul>
              <li>Finalize export deals</li>
              <li>Access export-specific features</li>
              <li>Connect with international buyers</li>
              <li>Manage export logistics</li>
            </ul>
          ` : `
            <p>Your exporter account application is currently under review.</p>
            <p>We'll notify you once the review is complete.</p>
          `}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: ${isApproved ? '#4CAF50' : '#ff9800'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Dashboard
            </a>
          </div>

          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(order, user) {
    const subject = `Payment Confirmed - Order #${order.orderNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center;">
          <h1>💳 Payment Confirmed</h1>
          <h2>Order #${order.orderNumber}</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName}!</h2>
          <p>Your payment has been successfully processed.</p>
          
          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
            <h3>Payment Details:</h3>
            <p><strong>Amount:</strong> ${order.orderDetails.currency} ${order.orderDetails.finalAmount}</p>
            <p><strong>Payment Method:</strong> ${order.payment.method}</p>
            <p><strong>Transaction ID:</strong> ${order.payment.transactionId || 'N/A'}</p>
            <p><strong>Paid At:</strong> ${new Date(order.payment.paidAt).toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p>Your order will now be processed and shipped according to the agreed timeline.</p>
          
          <p>Best regards,<br>The AgriLink Lanka Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Generic email sender
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get role-specific features for welcome email
  getRoleSpecificFeatures(role) {
    switch (role) {
      case 'farmer':
        return `
          <li>List your vegetables for export</li>
          <li>Set competitive prices</li>
          <li>Connect with international buyers</li>
          <li>Track your sales and orders</li>
        `;
      case 'buyer':
        return `
          <li>Browse quality vegetables from Sri Lankan farmers</li>
          <li>Place orders directly with farmers</li>
          <li>Track your orders and shipments</li>
          <li>Access export logistics support</li>
        `;
      case 'exporter':
        return `
          <li>Manage export logistics</li>
          <li>Connect farmers with international buyers</li>
          <li>Handle customs and documentation</li>
          <li>Track shipments and deliveries</li>
        `;
      default:
        return `
          <li>Access platform features</li>
          <li>Connect with other users</li>
          <li>Track your activities</li>
        `;
    }
  }
}

module.exports = new EmailService();

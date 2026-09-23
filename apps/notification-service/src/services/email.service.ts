import nodemailer from 'nodemailer';
import config from '../config';
import prisma from '../prisma/client';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('email-service');

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeTransporter().catch((err) => {
      logger.error('Failed to initialize EmailService transporter:', err);
    });
  }

  private async initializeTransporter() {
    if (this.isInitialized) return;

    try {
      let user = config.smtp.user;
      let pass = config.smtp.pass;
      let host = config.smtp.host;
      let port = config.smtp.port;

      if (!user || !pass) {
        logger.info('SMTP credentials not provided. Creating an Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        user = testAccount.user;
        pass = testAccount.pass;
        host = testAccount.smtp.host;
        port = testAccount.smtp.port;
        logger.info('Ethereal SMTP test account created. Credentials are intentionally not logged.');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      this.isInitialized = true;
      logger.info('Nodemailer SMTP Transporter initialized successfully.');
    } catch (error) {
      logger.error('Failed to create Nodemailer transporter:', error);
      throw error;
    }
  }

  private compileTemplate(template: string, data: Record<string, any>): string {
    let compiled = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiled = compiled.replace(regex, value !== undefined && value !== null ? String(value) : '');
    }
    return compiled;
  }

  async sendEmail(options: {
    to: string;
    templateName: string;
    templateData: Record<string, any>;
    notificationId?: string;
  }): Promise<boolean> {
    // Ensure initialized
    if (!this.isInitialized) {
      await this.initializeTransporter();
    }

    const { to, templateName, templateData, notificationId } = options;

    // Find template
    const template = await prisma.emailTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template || !template.isActive) {
      logger.warn(`Email template ${templateName} not found or is inactive. Email not sent.`);
      return false;
    }

    const subject = this.compileTemplate(template.subject, templateData);
    const htmlBody = this.compileTemplate(template.htmlBody, templateData);
    const textBody = template.textBody ? this.compileTemplate(template.textBody, templateData) : undefined;
    const safeTemplateData = Object.fromEntries(
      Object.entries(templateData).map(([key, value]) => [
        key,
        /token|url/i.test(key) ? '[REDACTED]' : value,
      ]),
    );

    // Create log
    const emailLog = await prisma.emailLog.create({
      data: {
        notificationId,
        to,
        subject,
        templateName,
        templateData: safeTemplateData as any,
        status: 'PENDING',
      },
    });

    return this.sendWithRetry(emailLog.id, to, subject, htmlBody, textBody);
  }

  private async sendWithRetry(
    logId: string,
    to: string,
    subject: string,
    html: string,
    text?: string,
    attempt = 1
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Transporter not initialized');
      }

      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
        text,
      });

      logger.info(`Email sent: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          retryCount: attempt - 1,
        },
      });

      return true;
    } catch (error: any) {
      logger.error(`Error sending email (attempt ${attempt}/3):`, error);

      if (attempt < 3) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            retryCount: attempt,
            error: error.message || String(error),
          },
        });

        // Retry in 5 seconds instead of 30 to make testing faster but still asynchronous
        setTimeout(() => {
          this.sendWithRetry(logId, to, subject, html, text, attempt + 1).catch((err) => {
            logger.error(`Retry attempt failed:`, err);
          });
        }, 5000);

        return false;
      } else {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            error: error.message || String(error),
            retryCount: attempt - 1,
          },
        });
        return false;
      }
    }
  }

  async seedTemplates() {
    const templates = [
      {
        name: 'WELCOME',
        subject: 'Welcome to NexaCommerce, {{ name }}!',
        htmlBody: `<h1>Welcome, {{ name }}!</h1><p>Thank you for registering at NexaCommerce. We are glad to have you!</p>`,
        textBody: `Welcome, {{ name }}!\nThank you for registering at NexaCommerce. We are glad to have you!`,
      },
      {
        name: 'EMAIL_VERIFICATION',
        subject: 'Verify your NexaCommerce email',
        htmlBody: `<h1>Verify your email</h1><p>Hello {{ name }}, confirm your NexaCommerce email by opening the secure link below. This link expires in 24 hours.</p><p><a href="{{ actionUrl }}">Verify email</a></p>`,
        textBody: `Hello {{ name }},\nVerify your NexaCommerce email using this link (expires in 24 hours):\n{{ actionUrl }}`,
      },
      {
        name: 'PASSWORD_RESET',
        subject: 'Reset your NexaCommerce password',
        htmlBody: `<h1>Reset your password</h1><p>Hello {{ name }}, use the secure link below to reset your NexaCommerce password. This link expires in 1 hour.</p><p><a href="{{ actionUrl }}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`,
        textBody: `Hello {{ name }},\nReset your NexaCommerce password using this link (expires in 1 hour):\n{{ actionUrl }}\nIf you did not request this, ignore this email.`,
      },
      {
        name: 'ORDER_CREATED',
        subject: 'Order Created #{{ orderId }}',
        htmlBody: `<h1>Order Confirmation</h1><p>Dear {{ customerName }}, your order <strong>#{{ orderId }}</strong> has been created successfully. Total amount is <strong>{{ totalAmount }}</strong>.</p>`,
        textBody: `Dear {{ customerName }},\nYour order #{{ orderId }} has been created. Total: {{ totalAmount }}.`,
      },
      {
        name: 'PAYMENT_SUCCESS',
        subject: 'Payment Success for Order #{{ orderId }}',
        htmlBody: `<h1>Payment Received</h1><p>Thank you! We have received your payment for order <strong>#{{ orderId }}</strong>.</p>`,
        textBody: `Thank you!\nWe have received your payment for order #{{ orderId }}.`,
      },
      {
        name: 'PAYMENT_FAILED',
        subject: 'Payment Failed for Order #{{ orderId }}',
        htmlBody: `<h1>Payment Failed</h1><p>Unfortunately, payment for order <strong>#{{ orderId }}</strong> has failed. Please retry your payment.</p>`,
        textBody: `Payment for order #{{ orderId }} has failed. Please retry your payment.`,
      },
      {
        name: 'ORDER_SHIPPED',
        subject: 'Order #{{ orderId }} Shipped!',
        htmlBody: `<h1>Your Order is On the Way</h1><p>Order <strong>#{{ orderId }}</strong> has been shipped via <strong>{{ courierName }}</strong> ({{ serviceCode }}). Tracking number: <strong>{{ trackingNumber }}</strong>.</p>`,
        textBody: `Order #{{ orderId }} has been shipped via {{ courierName }} ({{ serviceCode }}). Tracking number: {{ trackingNumber }}.`,
      },
      {
        name: 'ORDER_DELIVERED',
        subject: 'Order #{{ orderId }} Delivered!',
        htmlBody: `<h1>Your Order is Delivered</h1><p>Order <strong>#{{ orderId }}</strong> has been successfully delivered. Please confirm and complete your order.</p>`,
        textBody: `Order #{{ orderId }} has been successfully delivered. Please confirm and complete your order.`,
      },
      {
        name: 'LOW_STOCK',
        subject: 'ALERT: Low Stock for Product {{ productName }}',
        htmlBody: `<h1>Low Stock Alert</h1><p>Product <strong>{{ productName }}</strong> (ID: {{ productId }}) is running low on stock. Current stock: <strong>{{ currentStock }}</strong>. Threshold is <strong>{{ threshold }}</strong>.</p>`,
        textBody: `Low stock alert!\nProduct: {{ productName }} (ID: {{ productId }}).\nCurrent stock: {{ currentStock }}.\nThreshold: {{ threshold }}.`,
      },
      {
        name: 'REVIEW_RECEIVED',
        subject: 'New Review Received for {{ productName }}',
        htmlBody: `<h1>New Review Received</h1><p>Your product <strong>{{ productName }}</strong> received a new <strong>{{ rating }}-star</strong> review.</p><p><em>"{{ title }}"</em></p><p>{{ content }}</p>`,
        textBody: `Your product {{ productName }} received a new {{ rating }}-star review.\n"{{ title }}"\n{{ content }}`,
      },
      {
        name: 'ORDER_COMPLETED',
        subject: 'Order #{{ orderId }} Completed',
        htmlBody: `<h1>Order Completed</h1><p>Order <strong>#{{ orderId }}</strong> is now completed. Thank you for shopping with us!</p>`,
        textBody: `Order #{{ orderId }} is completed. Thank you for shopping with us!`,
      },
    ];

    for (const t of templates) {
      await prisma.emailTemplate.upsert({
        where: { name: t.name },
        update: t,
        create: t,
      });
    }

    logger.info('Email templates seeded successfully.');
  }
}

export const emailService = new EmailService();

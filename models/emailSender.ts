import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

class EmailSender {
    private transporter: Transporter;
    private from: string;

    constructor(host: string, port: number, secure: boolean, user: string, pass: string, from: string) {
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
            authMethod: "PLAIN",
            connectionTimeout: 10000
        });
        this.from = from;
    }

    async sendMail(to: string, subject: string, text: string, html: string): Promise<nodemailer.SentMessageInfo> {
        const mailOptions = {
            from: this.from,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

class EmailSenderHolder {
    constructor() {
    }

    static instance: EmailSender;

    static isInstantiated(): boolean {
        return EmailSenderHolder.instance != null;
    }

    static initSender(host: string, port: number, secure: boolean, user: string, pass: string, from: string): void {
        if (EmailSenderHolder.instance == null) {
            EmailSenderHolder.instance = new EmailSender(host, port, secure, user, pass, from);
        }
    }

    static async sendMail(to: string, subject: string, text: string, html: string): Promise<nodemailer.SentMessageInfo> {
        return await EmailSenderHolder.instance.sendMail(to, subject, text, html);
    }
}

export default EmailSenderHolder;

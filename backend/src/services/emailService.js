class EmailService {
  async sendEmail({ to, subject, text, html }) {
    if (!to || !subject) {
      throw new Error("Email recipient and subject are required");
    }

    // Stub transport for local development until SMTP/provider is wired in.
    if (process.env.NODE_ENV !== "production") {
      console.log("[EmailService] sendEmail", {
        to,
        subject,
        preview: text || html || "",
      });
    }

    return {
      success: true,
      messageId: `local-${Date.now()}`,
    };
  }

  async sendWelcomeEmail(to, username) {
    return this.sendEmail({
      to,
      subject: "Welcome to HUBLE",
      text: `Hi ${username || "there"}, welcome to HUBLE!`,
    });
  }

  async sendPasswordResetEmail(to, resetToken) {
    return this.sendEmail({
      to,
      subject: "Reset your HUBLE password",
      text: `Use this reset token to continue: ${resetToken}`,
    });
  }
}

module.exports = new EmailService();

// utils/emailTemplates.js
export const verificationEmail = (name, otp) => ({
  subject: "Verify your email",
  text: `Hello ${name},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nTeam`,
});

export const resetPasswordEmail = (name, resetUrl) => ({
  subject: "Reset your password",
  text: `Hello ${name},\n\nReset your password using the link below:\n\n${resetUrl}\n\nThis link will expire shortly.\n\nBest,\nTeam`,
});

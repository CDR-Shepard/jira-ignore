// This is a simple in-memory store. In a production environment,
// you'd want to use a more robust solution like Redis or a database.
export const otpStore = new Map<string, { otp: string; expiresAt: number }>()


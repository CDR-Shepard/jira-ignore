import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailgun"
import { otpStore } from "@/lib/otpStore"

const WHITELISTED_EMAILS = process.env.WHITELISTED_EMAILS?.split(",") || []

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Request body:", body)

    const { email } = body

    if (!email) {
      console.log("Missing email")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!WHITELISTED_EMAILS.includes(email)) {
      console.log("Email not authorized:", email)
      return NextResponse.json({ error: "Email not authorized" }, { status: 403 })
    }

    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store the OTP in memory
    otpStore.set(email, { otp, expiresAt })

    try {
      await sendEmail({
        to: email,
        subject: "Your Ship Log OTP",
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      })
    } catch (emailError) {
      console.error("Error in sendEmail:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    console.log("OTP sent successfully to:", email)
    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Error in POST handler:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}


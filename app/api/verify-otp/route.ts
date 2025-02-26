import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { otpStore } from "@/lib/otpStore"

const JWT_SECRET = process.env.JWT_SECRET || ""

export async function POST(req: Request) {
  console.log("Entering POST handler in verify-otp/route.ts")
  try {
    const body = await req.json()
    console.log("Request body:", body)

    const { email, otp } = body

    if (!email || !otp) {
      console.log("Missing email or OTP")
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    console.log(`Email: ${email}, OTP: ${otp}`)

    const storedOTP = otpStore.get(email)
    console.log("Stored OTP:", storedOTP)

    if (!storedOTP) {
      console.log("No OTP found for this email")
      return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 })
    }

    if (storedOTP.otp !== otp) {
      console.log("Invalid OTP")
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    if (Date.now() > storedOTP.expiresAt) {
      console.log("OTP has expired")
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // Clear the OTP after successful verification
    otpStore.delete(email)
    console.log("OTP verified successfully, generating token")

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Generate a JWT token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" })

    console.log("Token generated successfully")
    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error in OTP verification:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 })
  }
}


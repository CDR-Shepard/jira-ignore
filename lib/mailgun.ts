interface EmailParams {
  to: string
  subject: string
  text: string
}

export async function sendEmail({ to, subject, text }: EmailParams) {
  const auth = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64")

  const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      from: `Ship Log <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Mailgun API error:", errorText)
    throw new Error(`Failed to send email: ${response.statusText}`)
  }

  console.log("Email sent successfully")
  return await response.json()
}


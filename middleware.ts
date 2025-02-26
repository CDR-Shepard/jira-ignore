import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return NextResponse.next()
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/", "/api/(.*)"],
}

export function onError(error: Error) {
  console.error("Unhandled error in API route:", error)
  return new NextResponse(
    JSON.stringify({
      error: "An unexpected error occurred",
      details: error.message,
    }),
    { status: 500, headers: { "content-type": "application/json" } },
  )
}


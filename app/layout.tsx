import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import type React from "react"
import { Providers } from "./providers"
import { ThemeToggle } from "./components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GG Homes Ship Log",
  description: "Jira project tracking for GG Homes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'
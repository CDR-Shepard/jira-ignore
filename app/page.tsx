import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import KanbanBoard from "./components/KanbanBoard"
import { getJiraIssues } from "./services/jiraService"

export const revalidate = 0 // This ensures the page is not cached

export default async function Home() {
  const cookieStore = cookies()
  const authToken = cookieStore.get("authToken")

  if (!authToken) {
    redirect("/login")
  }

  const issues = await getJiraIssues()

  return (
    <main className="container mx-auto p-4 pt-16">
      <div className="flex items-center gap-6 mb-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gghomes_logo_200x200_half-sltRmc1OxUT8Ps5FOMdtTatQdMtEGe.png"
          alt="GG Homes Logo"
          width={110}
          height={110}
          className="rounded-lg w-[60px] h-[60px] md:w-[85px] md:h-[85px] lg:w-[110px] lg:h-[110px]"
          priority
        />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Ship Log</h1>
          <p className="text-muted-foreground mt-1">Track projects, view details, and comments. All in real-time.</p>
        </div>
      </div>
      <KanbanBoard issues={issues} />
    </main>
  )
}


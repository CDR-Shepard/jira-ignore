"use client"

import { useState } from "react"
import type { Issue } from "../types/jira"
import IssueCard from "./IssueCard"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, ListFilter } from "lucide-react"

interface KanbanBoardProps {
  issues: Issue[]
}

export default function KanbanBoard({ issues }: KanbanBoardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All")
  const [activeTab, setActiveTab] = useState<"sprint" | "backlog">("sprint")

  const departments = [
    "All",
    ...Array.from(
      new Set(issues.map((issue) => issue.department).filter((dept) => dept !== "Internal" && dept !== "Sensitive")),
    ).sort((a, b) => {
      if (a === "Unassigned") return 1
      if (b === "Unassigned") return -1
      return a.localeCompare(b)
    }),
  ]

  const statuses = ["To Do", "In Progress", "Done"]

  const filteredIssues = issues.filter(
    (issue) =>
      (selectedDepartment === "All" || issue.department === selectedDepartment) &&
      (activeTab === "sprint" ? issue.sprint && issue.sprint.state === "active" : issue.showInBacklog) &&
      new Date(issue.created).getFullYear() >= 2025 &&
      issue.department !== "Internal" &&
      issue.department !== "Sensitive",
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">Department</span>
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-border/10 text-sm">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "sprint" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("sprint")}
            className="text-sm"
          >
            Current Sprint
          </Button>
          <Button
            variant={activeTab === "backlog" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("backlog")}
            className="text-sm"
          >
            Backlog
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ListFilter className="w-4 h-4" />
        <span>Showing {filteredIssues.length} issues</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === "sprint" ? (
          statuses.map((status) => (
            <div key={status} className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground px-2">{status}</h2>
              <div className="space-y-2">
                {filteredIssues
                  .filter((issue) => issue.status === status)
                  .map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground px-2">Backlog</h2>
            <div className="space-y-2">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


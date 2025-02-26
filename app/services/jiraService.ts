import type { Issue } from "../types/jira"

const JIRA_DOMAIN = process.env.JIRA_DOMAIN ?? ""
const JIRA_EMAIL = process.env.JIRA_EMAIL ?? ""
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN ?? ""
const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA === "true"

// Log credential status for debugging (do not log full credentials in production)
console.log("Jira Domain present:", !!JIRA_DOMAIN)
console.log("Jira Email present:", !!JIRA_EMAIL)
console.log("Jira API Token present:", !!JIRA_API_TOKEN)
console.log("Using Dummy Data:", USE_DUMMY_DATA)

const headers = {
  Authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
}

const dummyData: Issue[] = [
  {
    id: "1",
    key: "PROJ-1",
    summary: "Implement login functionality",
    status: "To Do",
    department: "Engineering",
    subtasks: [
      { id: "1.1", summary: "Design login UI", status: "Done" },
      { id: "1.2", summary: "Implement authentication", status: "In Progress" },
    ],
    comments: [{ id: "1", body: "Let's use OAuth for authentication", author: "John Doe" }],
    created: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    key: "PROJ-2",
    summary: "Create marketing campaign",
    status: "In Progress",
    department: "Marketing",
    subtasks: [
      { id: "2.1", summary: "Define target audience", status: "Done" },
      { id: "2.2", summary: "Design promotional materials", status: "To Do" },
    ],
    comments: [{ id: "2", body: "We should focus on social media for this campaign", author: "Jane Smith" }],
    created: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "3",
    key: "PROJ-3",
    summary: "Optimize database queries",
    status: "Done",
    department: "Engineering",
    subtasks: [],
    comments: [
      {
        id: "3",
        body: "All queries have been optimized, resulting in a 30% performance improvement",
        author: "Alice Johnson",
      },
    ],
    created: "2025-02-01T00:00:00.000Z",
  },
]

async function getProjects() {
  console.log("Fetching Jira projects...")
  const response = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/project`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  const responseText = await response.text()
  console.log("Jira API response status:", response.status)
  console.log("Jira API response headers:", JSON.stringify(Object.fromEntries(response.headers), null, 2))
  console.log("Jira API response body:", responseText)

  if (!response.ok) {
    console.error("Jira API response not OK:", response.status, response.statusText, responseText)
    throw new Error(`Failed to fetch Jira projects: ${response.status} ${response.statusText}`)
  }

  try {
    const projects = JSON.parse(responseText)
    if (!Array.isArray(projects)) {
      console.error("Unexpected response format. Expected an array of projects.")
      return []
    }
    console.log("Number of projects found:", projects.length)
    console.log("Available projects:", projects.map((p: any) => p.key).join(", "))
    if (projects.length === 0) {
      console.warn("No projects found. This could be due to permissions or lack of projects in the Jira instance.")
    }
    return projects
  } catch (error) {
    console.error("Error parsing Jira API response:", error)
    throw new Error("Failed to parse Jira API response")
  }
}

export async function getJiraIssues(): Promise<Issue[]> {
  console.log("getJiraIssues called at:", new Date().toISOString())
  console.log(`JIRA_DOMAIN: ${JIRA_DOMAIN}`)
  console.log(`JIRA_EMAIL: ${JIRA_EMAIL}`)
  console.log(`JIRA_API_TOKEN: ${JIRA_API_TOKEN ? "Present" : "Missing"}`)
  console.log(`USE_DUMMY_DATA: ${USE_DUMMY_DATA}`)

  if (USE_DUMMY_DATA) {
    console.log("Using dummy data")
    return dummyData
  }

  if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    console.error("Jira credentials are missing or invalid")
    return dummyData
  }

  try {
    const projects = await getProjects()

    console.log("Projects fetched:", projects.length)

    if (projects.length === 0) {
      console.error("No projects found in Jira instance.")
      return []
    }

    const projectKey = projects[0].key
    console.log(`Using project key: ${projectKey}`)

    const timestamp = new Date().getTime()

    console.log("Fetching issues at:", new Date().toISOString())

    const response = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/search?timestamp=${timestamp}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jql: `project = ${projectKey}`,
        fields: [
          "summary",
          "description",
          "status",
          "subtasks",
          "comment",
          "customfield_10048",
          "created",
          "customfield_10020",
        ],
        maxResults: 50,
      }),
      cache: "no-store",
    })

    console.log("Issues fetch response status:", response.status)

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.status}`)
    }

    const data = await response.json()

    console.log("Issues fetched:", data.issues.length)

    // Log the first issue's data to debug fields
    if (data.issues.length > 0) {
      console.log("Sample issue fields:", JSON.stringify(data.issues[0].fields, null, 2))
    }

    const getDepartment = (field: any) => {
      if (typeof field === "string") return field
      if (field && typeof field === "object" && "value" in field) return field.value
      return "Unassigned"
    }

    return data.issues
      .filter((issue: any) => {
        const department = getDepartment(issue.fields.customfield_10048)
        return !["Internal", "Sensitive"].includes(department)
      })
      .map((issue: any) => {
        const sprintField = issue.fields.customfield_10020
        const activeSprint = Array.isArray(sprintField) ? sprintField.find((sprint) => sprint.state === "active") : null

        console.log("Issue info:", {
          key: issue.key,
          department: getDepartment(issue.fields.customfield_10048),
          sprintField,
          activeSprint,
        })

        return {
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description || "No description provided",
          status: issue.fields.status.name,
          department: getDepartment(issue.fields.customfield_10048),
          subtasks: (issue.fields.subtasks || []).map((subtask: any) => ({
            id: subtask.id,
            summary: subtask.fields.summary,
            status: subtask.fields.status.name,
          })),
          comments: (issue.fields.comment?.comments || []).map((comment: any) => ({
            id: comment.id,
            body: comment.body,
            author: comment.author.displayName,
          })),
          created: issue.fields.created,
          sprint: activeSprint
            ? {
                id: activeSprint.id,
                name: activeSprint.name,
                state: activeSprint.state,
              }
            : null,
          isBacklog: !activeSprint,
          showInBacklog: !activeSprint && !["Done", "Cancelled"].includes(issue.fields.status.name),
        }
      })
  } catch (error) {
    console.error("Error fetching Jira issues:", error)
    return dummyData
  }
}


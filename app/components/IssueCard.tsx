"use client"

import { useState } from "react"
import type { Issue } from "../types/jira"
import { renderADF } from "../utils/renderADF"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

interface IssueCardProps {
  issue: Issue
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const convertToMarkdown = (text: string) => {
    // Split the text into lines
    const lines = text.split("\n")
    let inCodeBlock = false

    // Process each line
    const processedLines = lines.map((line) => {
      // URL detection regex
      const urlRegex = /(https?:\/\/[^\s]+)/g

      // Code-like content detection (imports, interfaces, etc.)
      const codePatterns = [
        /^import\s+.*from\s+.*/,
        /^interface\s+.*/,
        /^type\s+.*/,
        /^class\s+.*/,
        /^function\s+.*/,
        /^const\s+.*/,
        /^let\s+.*/,
        /^var\s+.*/,
      ]

      // Check if line matches any code pattern
      const isCodeLine = codePatterns.some((pattern) => pattern.test(line.trim()))

      if (isCodeLine && !inCodeBlock) {
        inCodeBlock = true
        return "```typescript\n" + line
      } else if (!isCodeLine && inCodeBlock) {
        inCodeBlock = false
        return line + "\n```"
      } else if (isCodeLine) {
        return line
      }

      // Replace URLs with Markdown links
      return line.replace(urlRegex, (url) => `[${url}](${url})`)
    })

    // Close any open code block
    if (inCodeBlock) {
      processedLines.push("```")
    }

    return processedLines.join("\n")
  }

  const parseMarkdown = (content: string) => {
    // Convert plain text to Markdown
    const markdownContent = convertToMarkdown(content)

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                className="rounded-md text-sm my-2"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-800 rounded-md px-1 py-0.5" {...props}>
                {children}
              </code>
            )
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-2 italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" {...props} />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold my-2" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-bold my-1" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-xs font-bold my-1" {...props} />,
          p: ({ node, ...props }) => <p className="my-2" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-4 border-t border-gray-300 dark:border-gray-700" {...props} />,
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-md my-2" alt={props.alt || "Image"} {...props} />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    )
  }

  const renderDescription = (description: string | any) => {
    if (typeof description === "string") {
      return parseMarkdown(description)
    } else if (description && typeof description === "object" && description.content) {
      return renderADF(description)
    } else {
      return <p>No description available</p>
    }
  }

  // Rest of the component remains the same...
  return (
    <div className="group relative bg-secondary/50 hover:bg-secondary border border-border/10 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">{issue.summary}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{issue.key}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {issue.department}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="ml-1">{isExpanded ? "Less" : "More"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-3 h-3" />
            <span className="ml-1">{issue.comments.length}</span>
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-border/10">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Description</h4>
              <div className="text-sm text-muted-foreground break-words prose dark:prose-invert max-w-none">
                {renderDescription(issue.description)}
              </div>
            </div>
            {issue.subtasks.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Subtasks</h4>
                <ul className="space-y-2">
                  {issue.subtasks.map((subtask) => (
                    <li key={subtask.id} className="text-sm flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex-1 text-muted-foreground">{subtask.summary}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {subtask.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {showComments && (
          <div className="space-y-3 pt-3 border-t border-border/10">
            <h4 className="text-xs font-medium text-muted-foreground">Comments</h4>
            {issue.comments.length > 0 ? (
              <div className="space-y-3">
                {issue.comments.map((comment) => (
                  <div key={comment.id} className="text-sm bg-secondary rounded-lg p-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-medium text-foreground">{comment.author}</span>
                      {comment.created && (
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created)}</span>
                      )}
                    </div>
                    <div className="mt-2 text-muted-foreground break-words prose dark:prose-invert max-w-none">
                      {renderDescription(comment.body)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


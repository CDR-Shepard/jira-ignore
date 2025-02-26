import type React from "react"

interface ADFNode {
  type: string
  content?: ADFNode[]
  text?: string
  attrs?: Record<string, any>
}

export function renderADF(adf: ADFNode | ADFNode[]): React.ReactNode {
  if (Array.isArray(adf)) {
    return adf.map((node, index) => renderADF(node))
  }

  switch (adf.type) {
    case "doc":
      return <div key={Math.random()}>{adf.content?.map(renderADF)}</div>
    case "paragraph":
      return (
        <p key={Math.random()}>
          {adf.content?.map((node) =>
            node.type === "bulletList" || node.type === "orderedList" ? (
              renderADF(node)
            ) : (
              <span key={Math.random()}>{renderADF(node)}</span>
            ),
          )}
        </p>
      )
    case "text":
      return adf.text
    case "heading":
      const HeadingTag = `h${adf.attrs?.level || 1}` as keyof JSX.IntrinsicElements
      return <HeadingTag key={Math.random()}>{adf.content?.map(renderADF)}</HeadingTag>
    case "bulletList":
      return <ul key={Math.random()}>{adf.content?.map(renderADF)}</ul>
    case "orderedList":
      return <ol key={Math.random()}>{adf.content?.map(renderADF)}</ol>
    case "listItem":
      return <li key={Math.random()}>{adf.content?.map(renderADF)}</li>
    default:
      console.warn(`Unsupported ADF node type: ${adf.type}`)
      return null
  }
}


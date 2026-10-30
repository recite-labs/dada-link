import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Markdown } from "../../src/ui/Markdown.tsx"

describe("Markdown", () => {
  it("renders headings, lists and emphasis", () => {
    const { container } = render(<Markdown>{"## Your contract\n\n- **Paid** monthly"}</Markdown>)
    expect(container.querySelector("h2")?.textContent).toBe("Your contract")
    expect(container.querySelector("li strong")?.textContent).toBe("Paid")
  })

  it("never renders raw HTML", () => {
    const { container } = render(<Markdown>{'Hello <script>alert(1)</script> <b onclick="x()">bold</b>'}</Markdown>)
    expect(container.querySelector("script")).toBeNull()
    expect(container.querySelector("b")).toBeNull()
  })

  it("drops images so content cannot trigger third-party requests", () => {
    const { container } = render(<Markdown>{"![pixel](https://tracker.example/p.png)"}</Markdown>)
    expect(container.querySelector("img")).toBeNull()
  })

  it("removes javascript: links and opens external links safely", () => {
    const { container } = render(<Markdown>{"[bad](javascript:alert(1)) [good](https://www.iom.int)"}</Markdown>)
    const links = [...container.querySelectorAll("a")]
    expect(links.some((a) => a.getAttribute("href")?.startsWith("javascript"))).toBe(false)
    const good = links.find((a) => a.textContent === "good")
    expect(good).toHaveAttribute("target", "_blank")
    expect(good).toHaveAttribute("rel", "noopener noreferrer")
  })
})

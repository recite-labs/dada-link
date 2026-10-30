import type { ComponentProps } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { cx } from "./cx.ts"

const ExternalLink = ({ href, children }: ComponentProps<"a">) => {
  const external = href !== undefined && /^https?:\/\//.test(href)
  return (
    <a
      href={href}
      className="font-semibold text-indigo underline decoration-indigo/40 underline-offset-2 hover:decoration-indigo"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

const components: Components = {
  h1: ({ children }) => <h2 className="mt-6 text-[22px] leading-[28px] font-extrabold tracking-snug">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-6 text-[20px] leading-[26px] font-extrabold tracking-snug">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-5 text-[17px] leading-[24px] font-bold">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 text-[16px] font-bold">{children}</h4>,
  p: ({ children }) => <p className="mt-3">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 marker:text-indigo">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 marker:font-bold marker:text-indigo">{children}</ol>
  ),
  a: ExternalLink,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-l-4 border-marigold pl-4 text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-6 border-line" />,
  code: ({ children }) => <code className="rounded bg-surface px-1 py-0.5 text-[0.92em]">{children}</code>
}

/**
 * Safe Markdown: raw HTML is never rendered (`skipHtml`), images are dropped
 * (no third-party requests) and `javascript:` URLs are removed by the default
 * URL transform.
 */
export const Markdown = ({ children, className }: { readonly children: string; readonly className?: string }) => (
  <div className={cx("text-[16px] [&>*:first-child]:mt-0", className)}>
    <ReactMarkdown skipHtml disallowedElements={["img"]} unwrapDisallowed={false} components={components}>
      {children}
    </ReactMarkdown>
  </div>
)

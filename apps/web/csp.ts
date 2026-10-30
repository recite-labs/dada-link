import type { Plugin } from "vite"

/**
 * Content-Security-Policy for the production build. Everything is self-hosted
 * (code, fonts, API), so the browser itself refuses any third-party request.
 * Inline styles are allowed for React `style` attributes; scripts are not.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'"
].join("; ")

/** Adds the policy as a `<meta>` tag at build time only (the dev server needs inline scripts for HMR). */
export const contentSecurityPolicy = (policy: string = CONTENT_SECURITY_POLICY): Plugin => ({
  name: "dadalink:content-security-policy",
  apply: "build",
  transformIndexHtml: () => [
    { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head" }
  ]
})

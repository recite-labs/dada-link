export interface SplitDocument {
  readonly frontMatter: string
  readonly body: string
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/

/** Splits `---\n<yaml>\n---\n<markdown>`; `undefined` when there is no complete front matter block. */
export const splitFrontMatter = (text: string): SplitDocument | undefined => {
  const match = FRONT_MATTER.exec(text.replace(/^﻿/, ""))
  if (match === null) return undefined
  return { frontMatter: (match[1] ?? "").trim(), body: (match[2] ?? "").trim() }
}

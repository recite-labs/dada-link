import type { DirectoryEntry, DirectoryKind } from "@dadalink/domain"

export const DIRECTORY_GROUPS = ["emergency", "missions", "work", "support", "health", "return", "other"] as const
export type DirectoryGroup = (typeof DIRECTORY_GROUPS)[number]

const GROUP_OF: Readonly<Record<DirectoryKind, DirectoryGroup>> = {
  emergency: "emergency",
  police: "emergency",
  ambulance: "emergency",
  fire: "emergency",
  embassy: "missions",
  consulate: "missions",
  "labour-ministry": "work",
  "labour-hotline": "work",
  iom: "work",
  "un-agency": "work",
  "legal-aid": "work",
  shelter: "support",
  ngo: "support",
  helpline: "support",
  health: "health",
  "mental-health": "health",
  "returnee-service": "return",
  other: "other"
}

export interface DirectorySection {
  readonly group: DirectoryGroup
  readonly entries: ReadonlyArray<DirectoryEntry>
}

/**
 * Groups entries by what she needs (emergency first, then Ethiopian missions,
 * work and protection, support, health, returnee services). Empty groups are
 * dropped; entries keep the reviewed file order inside each group.
 */
export const groupDirectory = (entries: ReadonlyArray<DirectoryEntry>): ReadonlyArray<DirectorySection> =>
  DIRECTORY_GROUPS.map((group) => ({
    group,
    entries: entries.filter((entry) => GROUP_OF[entry.kind] === group)
  })).filter((section) => section.entries.length > 0)

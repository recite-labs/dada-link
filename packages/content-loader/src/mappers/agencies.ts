import { Agency, ContentFiles, type Country } from "@dadalink/domain"
import { decodeWith, parseYaml } from "../decode.ts"
import { type Checked, type ContentIssue, failed, ok } from "../issues.ts"

/** Guidance shown to users alongside agency checks (from the agencies file). */
export interface AgencyGuide {
  readonly country: Country
  readonly authority: string
  readonly howToCheck: string | undefined
}

export interface AgencyList {
  readonly agencies: ReadonlyArray<Agency>
  readonly guide: AgencyGuide
}

const decodeFile = decodeWith(ContentFiles.AgencyFile)
const decodeAgency = decodeWith(Agency)

/** `agencies/<country>.yaml` → agencies (only those published by an official source). */
export const parseAgencyFile = (path: string, text: string): Checked<AgencyList> => {
  const yaml = parseYaml(path, text)
  if (yaml.value === undefined) return failed(yaml.issues)
  const file = decodeFile(path, yaml.value)
  if (file.value === undefined) return failed(file.issues)
  const issues: Array<ContentIssue> = []
  const agencies: Array<Agency> = []
  for (const a of file.value.agencies) {
    const decoded = decodeAgency(path, {
      id: a.id,
      name: a.name,
      licenceNumber: a.licence_number ?? null,
      status: a.licence_status,
      ...(a.city === null || a.city === undefined ? {} : { region: a.city }),
      ...(a.phone === null || a.phone === undefined ? {} : { phone: a.phone }),
      ...(a.address === null || a.address === undefined ? {} : { address: a.address }),
      sourceUrl: a.source_url
    })
    issues.push(...decoded.issues)
    if (decoded.value !== undefined) agencies.push(decoded.value)
  }
  return ok(
    {
      agencies,
      guide: {
        country: file.value.country,
        authority: file.value.authority.name,
        howToCheck: file.value.how_to_check_for_users?.trim()
      }
    },
    issues
  )
}

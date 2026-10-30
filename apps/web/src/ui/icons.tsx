import type { SVGProps } from "react"

/** Stroke icons drawn on a 24px grid, matching the Paper designs. Always decorative: label the control instead. */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { readonly size?: number }

const Icon = ({
  paths,
  size = 22,
  strokeWidth = 2,
  ...props
}: IconProps & { readonly paths: ReadonlyArray<string> }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
)

const PHONE_PATHS = [
  "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"
]
export const PhoneIcon = (props: IconProps) => <Icon paths={PHONE_PATHS} {...props} />

const COPY_PATHS = ["M9 9h11v11H9z", "M5 15H4V4h11v1"]
export const CopyIcon = (props: IconProps) => <Icon paths={COPY_PATHS} {...props} />

const CHECK_PATHS = ["M20 6 9 17l-5-5"]
export const CheckIcon = (props: IconProps) => <Icon paths={CHECK_PATHS} {...props} />

const SHIELD_PATHS = ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"]
export const ShieldIcon = (props: IconProps) => <Icon paths={SHIELD_PATHS} {...props} />

const BOOK_PATHS = ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]
export const BookIcon = (props: IconProps) => <Icon paths={BOOK_PATHS} {...props} />

const BADGE_PATHS = [
  "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z",
  "m9 12 2 2 4-4"
]
export const BadgeIcon = (props: IconProps) => <Icon paths={BADGE_PATHS} {...props} />

const HOME_PATHS = ["M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"]
export const HomeIcon = (props: IconProps) => <Icon paths={HOME_PATHS} {...props} />

const CHAT_PATHS = ["M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1 1 21 12z"]
export const ChatIcon = (props: IconProps) => <Icon paths={CHAT_PATHS} {...props} />

const INFO_PATHS = ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 16v-4", "M12 8h.01"]
export const InfoIcon = (props: IconProps) => <Icon paths={INFO_PATHS} {...props} />

const ALERT_PATHS = [
  "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  "M12 9v4",
  "M12 17h.01"
]
export const AlertIcon = (props: IconProps) => <Icon paths={ALERT_PATHS} {...props} />

const EYE_OFF_PATHS = [
  "M3 3l18 18",
  "M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.4 3.3",
  "M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"
]
export const EyeOffIcon = (props: IconProps) => <Icon paths={EYE_OFF_PATHS} {...props} />

const PIN_PATHS = ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]
export const PinIcon = (props: IconProps) => <Icon paths={PIN_PATHS} {...props} />

const CHEVRON_RIGHT_PATHS = ["m9 18 6-6-6-6"]
export const ChevronRightIcon = (props: IconProps) => <Icon paths={CHEVRON_RIGHT_PATHS} {...props} />

const CHEVRON_DOWN_PATHS = ["m6 9 6 6 6-6"]
export const ChevronDownIcon = (props: IconProps) => <Icon paths={CHEVRON_DOWN_PATHS} {...props} />

const ARROW_LEFT_PATHS = ["M19 12H5", "m12 19-7-7 7-7"]
export const ArrowLeftIcon = (props: IconProps) => <Icon paths={ARROW_LEFT_PATHS} {...props} />

const SEND_PATHS = ["M12 19V5", "m5 12 7-7 7 7"]
export const SendIcon = (props: IconProps) => <Icon paths={SEND_PATHS} {...props} />

const GLOBE_PATHS = [
  "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  "M2 12h20",
  "M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"
]
export const GlobeIcon = (props: IconProps) => <Icon paths={GLOBE_PATHS} {...props} />

const CLOSE_PATHS = ["M18 6 6 18", "m6 6 12 12"]
export const CloseIcon = (props: IconProps) => <Icon paths={CLOSE_PATHS} {...props} />

const SEARCH_PATHS = ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "m21 21-4.3-4.3"]
export const SearchIcon = (props: IconProps) => <Icon paths={SEARCH_PATHS} {...props} />

const MORE_PATHS = ["M5 12h.01", "M12 12h.01", "M19 12h.01"]
export const MoreIcon = (props: IconProps) => <Icon paths={MORE_PATHS} {...props} />

/** Primary destinations (the SOS entry is separate and always present). */
export const NAV_ITEMS = [
  { key: "home", to: "/$locale", exact: true },
  { key: "ask", to: "/$locale/ask", exact: false },
  { key: "help", to: "/$locale/help", exact: false },
  { key: "about", to: "/$locale/about", exact: false }
] as const

import type { Country } from "@dadalink/domain"
import { useI18n } from "../i18n/index.ts"
import { ChevronDownIcon } from "./icons.tsx"

/** Compact country picker shown as a tinted pill (native select underneath for cheap phones). */
export const CountrySelect = ({
  value,
  options,
  onChange
}: {
  readonly value: Country
  readonly options: ReadonlyArray<Country>
  readonly onChange: (country: Country) => void
}) => {
  const { t } = useI18n()
  return (
    <div className="relative flex min-h-11 items-center rounded-full bg-tint pr-9 pl-4 text-[15px] font-bold text-indigo">
      <span aria-hidden="true">{t.countriesShort[value]}</span>
      <select
        aria-label={t.help.countryLabel}
        value={value}
        onChange={(event) => onChange(event.target.value as Country)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((country) => (
          <option key={country} value={country}>
            {t.countries[country]}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={16} strokeWidth={2.6} className="pointer-events-none absolute right-3.5" />
    </div>
  )
}

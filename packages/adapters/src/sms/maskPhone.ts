/** Keeps the country code and last two digits: `+2519******00`. For logs only. */
export const maskPhone = (phone: string): string =>
  phone.length <= 6 ? "***" : `${phone.slice(0, 5)}${"*".repeat(phone.length - 7)}${phone.slice(-2)}`

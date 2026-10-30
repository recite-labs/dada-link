const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu
/** 7+ digits, optionally with a leading + and separators: phone numbers. */
const PHONE = /\+?\d(?:[\s().-]*\d){6,}/g
/** Letter-prefixed long numbers such as passport or ID numbers (EP1234567). */
const ID_NUMBER = /(?<![\p{L}\p{N}])\p{L}{1,3}\d{5,}(?![\p{L}\p{N}])/gu

/**
 * Removes identifying details before text leaves the server (model calls).
 * DadaLink never needs them to answer, and the woman may not realise she
 * typed them.
 */
export const redactIdentifiers = (text: string): string =>
  text.replace(EMAIL, "[email]").replace(ID_NUMBER, "[number]").replace(PHONE, "[phone]")

const WHATSAPP_NUMBER_PATTERN = /^[1-9]\d{7,14}$/;

export function getWhatsappBusinessNumber() {
  const value = process.env.WHATSAPP_BUSINESS_NUMBER;
  return value && WHATSAPP_NUMBER_PATTERN.test(value) ? value : null;
}

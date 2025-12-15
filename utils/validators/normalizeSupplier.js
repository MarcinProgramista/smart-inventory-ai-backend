export function normalizeSupplierPayload(data) {
  const toStr = (v) =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : null;

  return {
    user_id: data.user_id ? Number(data.user_id) : null,
    name: toStr(data.name),
    contact_id: data.contact_id ? Number(data.contact_id) : null,
    street: toStr(data.street),
    postal_code: toStr(data.postal_code),
    city: toStr(data.city),
    country: toStr(data.country || "PL"),
  };
}

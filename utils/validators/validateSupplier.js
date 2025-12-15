export function validateSupplier(data, options = {}) {
  const errors = [];
  const { isUpdate = false } = options;

  const { user_id, name, contact_id, street, postal_code, city, country } =
    data;

  if (!isUpdate && !user_id) {
    errors.push("user_id is required");
  }
  if (!name || name.length < 2) {
    errors.push("Supplier name must have at least 2 characters");
  }
  if (!city) {
    errors.push("City is required");
  }
  if (!country || country.length !== 2) {
    errors.push("Invalid country code (use ISO2 like 'PL'");
  }
  if (postal_code && postal_code.length > 20) {
    errors.push("Postal code too long");
  }
  if (contact_id !== null && isNaN(contact_id)) {
    errors.push("Invalid contact_id");
  }
  return errors;
}

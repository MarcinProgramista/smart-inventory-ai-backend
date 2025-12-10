// validators/itemValidator.js

export function validateItem(data) {
  const errors = [];

  const {
    user_id,
    category_id,
    name,
    quantity,
    min_quantity,
    supplier_id,
    price,
    description,
  } = data;

  if (!user_id) errors.push("Missing user_id");

  if (!name || typeof name !== "string" || name.trim().length < 2)
    errors.push("Invalid item name");

  if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 0)
    errors.push("Quantity must be a non-negative number");

  if (
    min_quantity === undefined ||
    isNaN(Number(min_quantity)) ||
    Number(min_quantity) < 0
  )
    errors.push("Min quantity must be a non-negative number");

  if (!supplier_id || isNaN(Number(supplier_id)))
    errors.push("Invalid supplier_id");

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
    errors.push("Price must be a positive number");

  if (description && typeof description !== "string")
    errors.push("Description must be a string");

  if (category_id && isNaN(Number(category_id)))
    errors.push("Invalid category_id");

  return errors;
}

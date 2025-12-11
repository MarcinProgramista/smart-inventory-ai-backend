export function validateItem(data, options = {}) {
  const errors = [];
  const { isUpdate = false } = options;

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

  // --- VALIDATION RULES ---

  // user_id tylko dla addItem
  if (!isUpdate) {
    if (!user_id) errors.push("Missing user_id");
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push("Invalid item name");
    }
  } else if (!isUpdate) {
    errors.push("Name is required");
  }

  if (quantity !== undefined) {
    if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      errors.push("Quantity must be a non-negative number");
    }
  } else if (!isUpdate) {
    errors.push("Quantity is required");
  }

  if (min_quantity !== undefined) {
    if (isNaN(Number(min_quantity)) || Number(min_quantity) < 0) {
      errors.push("Min quantity must be a non-negative number");
    }
  } else if (!isUpdate) {
    errors.push("Min quantity is required");
  }

  if (price !== undefined) {
    if (isNaN(Number(price)) || Number(price) < 0) {
      errors.push("Price must be a positive number");
    }
  } else if (!isUpdate) {
    errors.push("Price is required");
  }

  if (supplier_id !== undefined) {
    if (isNaN(Number(supplier_id))) errors.push("Invalid supplier_id");
  } else if (!isUpdate) {
    errors.push("supplier_id is required");
  }

  if (category_id !== undefined && isNaN(Number(category_id))) {
    errors.push("Invalid category_id");
  }

  if (description !== undefined && typeof description !== "string") {
    errors.push("Description must be a string");
  }

  return errors;
}

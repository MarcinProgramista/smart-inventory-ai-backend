// utils/validators/itemValidator.js

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

  /* -------------------------------------
     user_id — wymagany tylko przy ADD
  ------------------------------------- */
  if (!isUpdate && !user_id) {
    errors.push("Missing user_id");
  }

  /* -------------------------------------
     Name
  ------------------------------------- */
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push("Invalid item name");
    }
  } else if (!isUpdate) {
    errors.push("Name is required");
  }

  /* -------------------------------------
     Quantity
  ------------------------------------- */
  if (quantity !== undefined) {
    if (isNaN(quantity) || quantity < 0) {
      errors.push("Quantity must be a non-negative number");
    }
  } else if (!isUpdate) {
    errors.push("Quantity is required");
  }

  /* -------------------------------------
     Min quantity
  ------------------------------------- */
  if (min_quantity !== undefined) {
    if (isNaN(min_quantity) || min_quantity < 0) {
      errors.push("Min quantity must be a non-negative number");
    }
  } else if (!isUpdate) {
    errors.push("Min quantity is required");
  }

  /* -------------------------------------
     Price
  ------------------------------------- */
  if (price !== undefined) {
    if (isNaN(price) || price < 0) {
      errors.push("Price must be a positive number");
    }
  } else if (!isUpdate) {
    errors.push("Price is required");
  }

  /* -------------------------------------
     Supplier ID
  ------------------------------------- */
  if (supplier_id !== undefined) {
    if (isNaN(supplier_id)) {
      errors.push("Invalid supplier_id");
    }
  } else if (!isUpdate) {
    errors.push("supplier_id is required");
  }

  /* -------------------------------------
     Category ID
  ------------------------------------- */
  if (category_id !== undefined && category_id !== null) {
    if (isNaN(category_id)) {
      errors.push("Invalid category_id");
    }
  }

  /* -------------------------------------
     Description
  ------------------------------------- */
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      errors.push("Description must be a string");
    }
  }

  return errors;
}

export function normalizeItemPayload(data) {
  return {
    user_id: data.user_id ? Number(data.user_id) : undefined,
    category_id: data.category_id ? Number(data.category_id) : null,
    name: data.name?.trim() || "",
    quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
    min_quantity:
      data.min_quantity !== undefined ? Number(data.min_quantity) : undefined,
    supplier_id: data.supplier_id ? Number(data.supplier_id) : undefined,
    price: data.price !== undefined ? Number(data.price) : undefined,
    description: data.description?.trim() || null,
  };
}

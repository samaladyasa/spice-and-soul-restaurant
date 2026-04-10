const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://j3xxjnoaog.execute-api.ap-south-1.amazonaws.com/prod";

export async function getMenu() {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function createMenuItem(
  token: string,
  item: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE}/menu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateMenuItem(
  token: string,
  itemId: string,
  item: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE}/menu/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function deleteMenuItem(token: string, itemId: string) {
  const res = await fetch(`${API_BASE}/menu/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getUploadUrl(
  token: string,
  fileName: string,
  contentType: string
) {
  const res = await fetch(`${API_BASE}/menu/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileName, contentType }),
  });
  return res.json();
}

export async function uploadToS3(url: string, file: File) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!res.ok) throw new Error("S3 upload failed");
}

export async function createOrder(
  token: string,
  orderData: {
    items: { name: string; price: number; qty: number }[];
    total: number;
    name: string;
    address: string;
    paymentMethod: string;
    razorpayPaymentId?: string;
  }
) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  return res.json();
}

export async function getOrders(token: string) {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getAdminOrders(token: string) {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function sendReservation(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  requests: string;
}) {
  const res = await fetch(`${API_BASE}/reservation/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createPaymentOrder(amount: number, receipt: string) {
  const res = await fetch(`${API_BASE}/payment/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt }),
  });
  return res.json();
}

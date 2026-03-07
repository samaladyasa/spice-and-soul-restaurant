/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/Notification";
import { getMenu, getAdminOrders, deleteMenuItem, getUploadUrl, uploadToS3, createMenuItem, updateMenuItem } from "@/libs/api";

interface MenuItem {
  itemId: string;
  name: string;
  price: number;
  img: string;
  alt: string;
  rating: string;
  desc: string;
  categories: string[];
  section: string;
}

interface Order {
  orderId: string;
  userEmail: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminPage() {
  const { isAdmin, loading, getIdToken } = useAuth();
  const [tab, setTab] = useState<"orders" | "menu">("orders");

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="page-banner"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
        <h1>Admin Dashboard</h1>
        <p>Manage orders &amp; menu items</p>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "30px auto",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button
            className={`filter-btn${tab === "orders" ? " active" : ""}`}
            onClick={() => setTab("orders")}
          >
            Orders
          </button>
          <button
            className={`filter-btn${tab === "menu" ? " active" : ""}`}
            onClick={() => setTab("menu")}
          >
            Menu Items
          </button>
        </div>

        {tab === "orders" ? (
          <OrdersTab getIdToken={getIdToken} />
        ) : (
          <MenuTab getIdToken={getIdToken} />
        )}
      </div>
    </>
  );
}

function OrdersTab({ getIdToken }: { getIdToken: () => Promise<string | null> }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken();
        const data = await getAdminOrders(token!);
        if (data.success) {
          const sorted = (data.orders || []).sort(
            (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
        }
      } catch (err) {
        console.error("Failed to load orders", err);
      }
      setLoadingOrders(false);
    }
    load();
  }, [getIdToken]);

  if (loadingOrders) return <p>Loading orders…</p>;

  return (
    <div>
      <h3 style={{ marginBottom: 15 }}>All Orders ({orders.length})</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--table-header-bg)",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Items</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} style={{ borderBottom: "1px solid var(--table-row-border)" }}>
                  <td style={tdStyle}>{o.orderId}</td>
                  <td style={tdStyle}>{o.userEmail}</td>
                  <td style={tdStyle}>
                    {(o.items || []).map((i) => i.name).join(", ")}
                  </td>
                  <td style={tdStyle}>₹{o.total}</td>
                  <td style={tdStyle}>{o.paymentMethod || "—"}</td>
                  <td style={tdStyle}>{o.status}</td>
                  <td style={tdStyle}>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "10px 12px" };
const tdStyle: React.CSSProperties = { padding: "8px 12px" };

function MenuTab({ getIdToken }: { getIdToken: () => Promise<string | null> }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingItems(true);
    try {
      const data = await getMenu();
      if (data.success) {
        const sectionOrder = ["starters", "mains", "breads", "desserts", "drinks"];
        const sorted = (data.items || []).sort((a: MenuItem, b: MenuItem) => {
          const ai = sectionOrder.indexOf(a.section);
          const bi = sectionOrder.indexOf(b.section);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        setItems(sorted);
      }
    } catch (err) {
      console.error("Failed to load menu items", err);
    }
    setLoadingItems(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      const token = await getIdToken();
      await deleteMenuItem(token!, pendingDeleteId);
      load();
    } catch (err) {
      console.error(err);
    }
    setPendingDeleteId(null);
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setShowForm(true);
  }

  if (loadingItems) return <p>Loading menu…</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <h3>Menu Items ({items.length})</h3>
        <button className="btn-add" onClick={openCreate}>
          + Add Item
        </button>
      </div>

      {showForm && (
        <MenuItemForm
          initial={editing}
          getIdToken={getIdToken}
          onDone={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {items.length === 0 ? (
        <p>No menu items yet. Add some!</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {items.map((item) => (
            <div
              key={item.itemId}
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 2px 6px var(--shadow-color)",
              }}
            >
              {item.img && (
                <img
                  src={item.img}
                  alt={item.alt || item.name}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                />
              )}
              <div style={{ padding: 12 }}>
                <h4 style={{ margin: 0 }}>{item.name}</h4>
                <p style={{ margin: "4px 0", color: "var(--text-secondary)", fontSize: 13 }}>
                  {item.section} • ₹{item.price}
                </p>
                <p style={{ margin: "4px 0", fontSize: 13 }}>{item.desc}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => openEdit(item)}
                    style={{
                      padding: "4px 12px",
                      background: "#3498db",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(item.itemId)}
                    style={{
                      padding: "4px 12px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDeleteId && (
        <>
          <div
            onClick={() => setPendingDeleteId(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
              zIndex: 9998,
            }}
          />
          <div
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: "var(--bg-surface-alt)", color: "var(--text-primary)",
              padding: "32px", borderRadius: 14,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              zIndex: 9999, textAlign: "center", maxWidth: 380, width: "90%",
            }}
          >
            <p style={{ fontSize: 16, marginBottom: 20 }}>
              Delete this menu item?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setPendingDeleteId(null)}
                style={{
                  padding: "8px 20px", borderRadius: 6, border: "1px solid var(--border-color-strong)",
                  background: "var(--bg-surface)", color: "var(--text-primary)",
                  cursor: "pointer", fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "8px 20px", borderRadius: 6, border: "none",
                  background: "#e74c3c", color: "#fff",
                  cursor: "pointer", fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function compressImage(
  file: File,
  maxWidth = 600,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (h / w) * maxWidth;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        const MAX_SIZE = 300_000; // ~300KB safe limit for DynamoDB item field
        let q = quality;
        while (dataUrl.length > MAX_SIZE && q > 0.1) {
          q -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", q);
        }
        if (dataUrl.length > MAX_SIZE) {
          const scale = 0.5;
          canvas.width = w * scale;
          canvas.height = h * scale;
          ctx.drawImage(img, 0, 0, w * scale, h * scale);
          dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function MenuItemForm({
  initial,
  getIdToken,
  onDone,
  onCancel,
}: {
  initial: MenuItem | null;
  getIdToken: () => Promise<string | null>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const showNotification = useNotification();
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [section, setSection] = useState(initial?.section || "starters");
  const [categories, setCategories] = useState<string[]>(
    initial?.categories || []
  );
  const [rating, setRating] = useState(initial?.rating || "★★★★☆ 4.0");
  const [imgUrl, setImgUrl] = useState(initial?.img || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial?.img || "");
  const [imgSource, setImgSource] = useState<"url" | "file">(
    initial?.img ? "url" : "url"
  );
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const sectionToCategoryMap: Record<string, string> = {
    breads: "breads",
    desserts: "dessert",
    drinks: "drinks",
  };

  const allCategoryOptions = [
    { key: "veg", label: "Veg" },
    { key: "nonveg", label: "Non-Veg" },
    { key: "signature", label: "Chef's Specials" },
    { key: "breads", label: "Breads" },
    { key: "dessert", label: "Desserts" },
    { key: "drinks", label: "Drinks" },
  ];

  function toggleCategory(key: string) {
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setImgSource("file");
      setUploadStatus("");
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    setImgUrl(url);
    setImgSource("url");
    setImageFile(null);
    setImagePreview(url);
    setUploadStatus("");
  }

  async function resolveImage(): Promise<string> {
    if (imgSource === "url" || !imageFile) {
      return imgUrl;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      setUploadStatus("Image too large (max 5 MB). Please use a smaller file. ✗");
      return "";
    }

    try {
      setUploadStatus("Requesting upload URL…");
      const token = await getIdToken();
      if (!token) {
        setUploadStatus("Not authenticated — please log in again. ✗");
        return "";
      }

      console.log(
        `Uploading ${imageFile.name} (${(imageFile.size / 1024).toFixed(0)} KB, type=${imageFile.type})`
      );

      const data = await getUploadUrl(token, imageFile.name, imageFile.type || "image/jpeg");
      console.log("Presigned URL response:", data);

      if (!data.success || !data.uploadUrl) {
        throw new Error(data.error || "Failed to get upload URL");
      }

      setUploadStatus("Uploading to S3…");
      await uploadToS3(data.uploadUrl, imageFile);

      setUploadStatus("Uploaded ✓");
      return data.imageUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Image upload error:", err);
      setUploadStatus(`Upload failed: ${msg} ✗`);
      return "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !section) {
      showNotification("Name, price, and section are required.", "error");
      return;
    }
    setSaving(true);

    const finalImg = await resolveImage();

    if (imageFile && imgSource === "file" && !finalImg) {
      showNotification(
        "Image could not be uploaded. Please use an image URL instead, or try a smaller image.",
        "error"
      );
      setSaving(false);
      return;
    }

    const finalCategories = [...categories];
    const sectionCat = sectionToCategoryMap[section];
    if (sectionCat && !finalCategories.includes(sectionCat)) {
      finalCategories.push(sectionCat);
    }

    const payload = {
      name,
      price: Number(price),
      desc,
      section,
      categories: finalCategories,
      rating,
      img: finalImg,
      alt: name,
    };

    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 380_000) {
      showNotification(
        `Image is too large to save (${(payloadSize / 1024).toFixed(0)}KB). Please use a smaller image or provide an image URL instead.`,
        "error"
      );
      setSaving(false);
      return;
    }

    try {
      const token = await getIdToken();
      if (isEdit) {
        await updateMenuItem(token!, initial!.itemId, payload);
      } else {
        await createMenuItem(token!, payload);
      }
      onDone();
    } catch (err) {
      console.error(err);
      showNotification("Failed to save menu item.", "error");
    }
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 5,
    border: "1px solid var(--border-color-strong)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: 14,
    boxSizing: "border-box",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--bg-surface)",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        border: "1px solid var(--border-color)",
      }}
    >
      <h4 style={{ marginTop: 0 }}>{isEdit ? "Edit Item" : "New Menu Item"}</h4>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price (₹) *</label>
          <input
            style={inputStyle}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Section *</label>
          <select
            style={inputStyle}
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="starters">Starters</option>
            <option value="mains">Main Courses</option>
            <option value="breads">Indian Breads</option>
            <option value="desserts">Desserts</option>
            <option value="drinks">Drinks</option>
          </select>
        </div>
        <div>
          <label>Categories</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {allCategoryOptions.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: categories.includes(opt.key)
                    ? "2px solid #d35400"
                    : "1px solid var(--border-color-strong)",
                  background: categories.includes(opt.key)
                    ? "var(--cat-active-bg)"
                    : "var(--cat-inactive-bg)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={categories.includes(opt.key)}
                  onChange={() => toggleCategory(opt.key)}
                  style={{ display: "none" }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label>Description</label>
          <input
            style={inputStyle}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <label>Rating</label>
          <input
            style={inputStyle}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
        <div>
          <label>Image URL</label>
          <input
            style={{
              ...inputStyle,
              ...(imgSource === "file" && imageFile
                ? { opacity: 0.5 }
                : {}),
            }}
            value={imgUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label>or upload from device</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: 4 }}
          />
          {imageFile && (
            <span
              style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10 }}
            >
              {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
            </span>
          )}
        </div>

        {imagePreview && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: 10,
              background: "var(--preview-bg)",
              border: "1px solid var(--preview-border)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <label
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Image Preview
            </label>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                objectFit: "contain",
                borderRadius: 6,
              }}
              onError={() => setImagePreview("")}
            />
          </div>
        )}

        {uploadStatus && (
          <div
            style={{
              gridColumn: "1 / -1",
              fontSize: 13,
              color: uploadStatus.includes("✗")
                ? "#e74c3c"
                : uploadStatus.includes("✓")
                ? "#27ae60"
                : "#d35400",
              fontWeight: 500,
            }}
          >
            {uploadStatus}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <button
          type="submit"
          className="btn-add"
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "8px 20px",
            border: "1px solid var(--cancel-border)",
            borderRadius: 5,
            background: "var(--cancel-bg)",
            color: "var(--cancel-color)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

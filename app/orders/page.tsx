"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/libs/api";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  date: string;
  createdAt: string;
  items: OrderItem[];
  total: string;
  status: string;
}

export default function OrdersPage() {
  const { userEmail, getIdToken, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !userEmail) return;

    async function fetchOrders() {
      try {
        const token = await getIdToken();
        if (token && userEmail) {
          const data = await getOrders(token);
          if (data.success && data.orders) {
            const mapped: Order[] = data.orders.map(
              (o: { orderId?: string; createdAt?: string; items?: OrderItem[]; total?: string | number; status?: string }) => ({
                id: o.orderId || "",
                date: o.createdAt
                  ? new Date(o.createdAt).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "",
                createdAt: o.createdAt || "",
                items: o.items || [],
                total:
                  typeof o.total === "number"
                    ? "₹" + o.total
                    : o.total || "",
                status: o.status || "pending",
              })
            );
            mapped.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(mapped);
            setLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch orders from backend:", err);
      }
      setOrders([]);
      setLoaded(true);
    }

    fetchOrders();
  }, [getIdToken, userEmail, authLoading]);

  function clearHistory() {
    localStorage.removeItem("orderHistory");
    setOrders([]);
  }

  return (
    <>
      <div className="page-banner" style={{
        background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textAlign: "center",
        padding: "60px 20px",
      }}>
        <h1>Your Orders</h1>
        <p>Track your past delicious meals.</p>
      </div>

      {authLoading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      ) : !userEmail ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>Please Log In</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            You need to be logged in to view your order history.
          </p>
          <a
            href="/login?redirect=/orders"
            className="btn-add"
            style={{ display: "inline-block", padding: "12px 32px", fontSize: "16px" }}
          >
            Log In / Sign Up
          </a>
        </div>
      ) : (
      <>
      <div
        className="container"
        style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px" }}
      >
        {!loaded ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            Loading history...
          </p>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              marginTop: "50px",
            }}
          >
            <h3 style={{ marginBottom: "30px", fontSize: "24px" }}>
              No orders found yet! 🍛
            </h3>
            <Link
              href="/services"
              className="btn-add"
              style={{ display: "inline-block", marginTop: "20px" }}
            >
              Order Now
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="history-card">
              <div className="h-header">
                <span className="h-id">{order.id}</span>
                <span className="h-date">{order.date}</span>
              </div>
              <div className="h-body">
                <ul className="h-items">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.qty} — ₹{item.price * item.qty}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-footer">
                <span className="h-total">Total: {order.total}</span>
                <span className="h-status">{order.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <button
          onClick={clearHistory}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Clear History
        </button>
      </div>
      </>
      )}
    </>
  );
}

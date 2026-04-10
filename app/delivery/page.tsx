"use client";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/Notification";
import { createOrder, createPaymentOrder } from "@/libs/api";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

function getPaymentMethodLabel(method: string) {
  const methodMap: Record<string, string> = {
    cod: "Cash on Delivery",
    "razorpay-upi": "UPI / GPay / PhonePe (via Razorpay)",
    "razorpay-card": "Credit / Debit Card (via Razorpay)",
    "razorpay-wallet": "Multiple Payment Methods (via Razorpay)",
  };
  return methodMap[method] || method;
}

export default function DeliveryPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { userEmail, getIdToken, loading: authLoading } = useAuth();
  const showNotification = useNotification();
  const [orderName, setOrderName] = useState("");
  const [orderAddress, setOrderAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const subtotal = totalPrice;
  const delivery = subtotal >= 500 ? 0 : 40;
  const discount = 20;
  const total = subtotal + delivery - discount;

  useEffect(() => {
    const savedName = localStorage.getItem("deliveryName");
    const savedAddress = localStorage.getItem("deliveryAddress");
    const savedPayment = localStorage.getItem("deliveryPayment");
    if (savedName) setOrderName(savedName);
    if (savedAddress) setOrderAddress(savedAddress);
    if (savedPayment) setPaymentMethod(savedPayment);
  }, []);

  useEffect(() => {
    localStorage.setItem("deliveryName", orderName);
  }, [orderName]);
  useEffect(() => {
    localStorage.setItem("deliveryAddress", orderAddress);
  }, [orderAddress]);
  useEffect(() => {
    localStorage.setItem("deliveryPayment", paymentMethod);
  }, [paymentMethod]);

  const saveOrderToBackend = useCallback(
    async (orderData: {
      items: { name: string; price: number; qty: number }[];
      total: number;
      name: string;
      address: string;
      paymentMethod: string;
      razorpayPaymentId?: string;
    }) => {
      try {
        const token = await getIdToken();
        if (!token) {
          throw new Error("Not authenticated");
        }
        const data = await createOrder(token, orderData);
        if (data.success) return data.order;
        console.warn("Backend order save failed:", data.error);
        return null;
      } catch (err) {
        console.warn("Backend order save error:", err);
        return null;
      }
    },
    [getIdToken]
  );

  const initializeRazorpayPayment = useCallback(
    async (amount: number) => {
      const orderId = "ORD-" + Date.now();
      try {
        const data = await createPaymentOrder(amount, orderId);

        if (!data.success) {
          showNotification(
            "Failed to create payment order. Please try again.",
            "error"
          );
          return;
        }

        const prefill: Record<string, string> = {
          name: orderName,
          email: userEmail || "",
          contact: "",
        };
        if (upiId.trim()) prefill.vpa = upiId.trim();

        let method: Record<string, boolean> = {};
        if (paymentMethod === "razorpay-upi") {
          method = { upi: true, card: false, netbanking: false, wallet: false };
        } else if (paymentMethod === "razorpay-card") {
          method = { upi: false, card: true, netbanking: false, wallet: false };
        }

        const options: Record<string, unknown> = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "Spice & Soul",
          description: "Food Order - " + orderId,
          prefill,
          theme: { color: "#d35400" },
          handler: function (response: { razorpay_payment_id: string }) {
            const orderItems = cart.map((i) => ({
              name: i.name,
              price: i.price,
              qty: i.qty,
            }));

            saveOrderToBackend({
              items: orderItems,
              total: amount,
              name: orderName,
              address: orderAddress,
              paymentMethod: getPaymentMethodLabel(paymentMethod),
              razorpayPaymentId: response.razorpay_payment_id,
            });

            clearCart();
            showNotification(
              "Payment successful! Your order has been placed.",
              "success"
            );
            setTimeout(() => (window.location.href = "/orders"), 1500);
          },
          modal: {
            ondismiss: function () {
              showNotification(
                "Payment cancelled. Your order was not placed.",
                "error"
              );
            },
          },
        };

        if (Object.keys(method).length > 0)
          options.method = method;

        const rzp = new window.Razorpay(options);
        rzp.on(
          "payment.failed",
          function (response: { error: { description?: string } }) {
            showNotification(
              "Payment failed: " +
                (response.error.description || "Unknown error"),
              "error"
            );
          }
        );
        rzp.open();
      } catch (err) {
        console.error("Razorpay error:", err);
        showNotification("Something went wrong. Please try again.", "error");
      }
    },
    [orderName, orderAddress, cart, paymentMethod, upiId, clearCart, showNotification, saveOrderToBackend]
  );

  function placeOrder() {
    if (!userEmail) {
      showNotification("Please log in to place an order.", "error");
      return;
    }
    if (!orderName || !orderAddress) {
      showNotification("Please fill in all required fields!", "error");
      return;
    }
    if (cart.length === 0) {
      showNotification("Your cart is empty!", "error");
      return;
    }

    if (paymentMethod === "cod") {
      const orderItems = cart.map((i) => ({
        name: i.name,
        price: i.price,
        qty: i.qty,
      }));

      saveOrderToBackend({
        items: orderItems,
        total: total,
        name: orderName,
        address: orderAddress,
        paymentMethod: "Cash on Delivery",
      });

      clearCart();
      showNotification(
        "Order placed successfully! Your order will be delivered COD.",
        "success"
      );
      setTimeout(() => (window.location.href = "/orders"), 1500);
    } else {
      initializeRazorpayPayment(total);
    }
  }

  if (authLoading) {
    return (
      <>
        <div className="hero" style={{ height: "40vh", minHeight: "300px" }}>
          <h1>Fast Home Delivery</h1>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!userEmail) {
    return (
      <>
        <div className="hero" style={{ height: "40vh", minHeight: "300px" }}>
          <h1>Fast Home Delivery</h1>
          <p>
            Craving Spice &amp; Soul? We bring the flavors directly to your
            doorstep.
          </p>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>Please Log In to Order</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            You need to be logged in to place an order. Your cart items will be
            saved.
          </p>
          <a
            href="/login?redirect=/delivery"
            className="btn-add"
            style={{ display: "inline-block", padding: "12px 32px", fontSize: "16px" }}
          >
            Log In / Sign Up
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="hero" style={{ height: "40vh", minHeight: "300px" }}>
        <h1>Fast Home Delivery</h1>
        <p>
          Craving Spice &amp; Soul? We bring the flavors directly to your
          doorstep.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-form-card">
          <h3>Complete Your Order</h3>

          <div id="orderForm">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                placeholder="Enter full address"
                value={orderAddress}
                onChange={(e) => setOrderAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cod">Cash on Delivery</option>
                <option value="razorpay-upi">
                  UPI / GPay / PhonePe via Razorpay
                </option>
                <option value="razorpay-card">
                  Credit / Debit Card via Razorpay
                </option>
                <option value="razorpay-wallet">
                  Wallet / All Methods via Razorpay
                </option>
              </select>
            </div>

            {paymentMethod === "razorpay-upi" && (
              <div className="form-group" style={{ animation: "fadeIn 0.5s" }}>
                <label>Enter UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="username@oksbi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === "razorpay-card" && (
              <div style={{ animation: "fadeIn 0.5s" }}>
                <div className="form-group">
                  <label>Card Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Expiry Date (Optional)</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>CVV (Optional)</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod !== "cod" && (
              <div
                style={{
                  animation: "fadeIn 0.5s",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  borderLeft: "6px solid #d35400",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  <strong>💳 Secure Payment via Razorpay</strong>
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "#ffffff",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  Razorpay&apos;s secure checkout will open with your order
                  total. All transactions are encrypted and secure.
                </p>
              </div>
            )}

            <div className="form-group">
              <label>Your Cart Items</label>
              <div className="cart-list">
                {cart.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "10px",
                    }}
                  >
                    Your cart is empty.{" "}
                    <a href="/services">Add items</a>
                  </p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {cart.map((item) => (
                      <li
                        key={item.name}
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid var(--border-color)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {item.name} × {item.qty}
                        </span>
                        <span style={{ fontWeight: "bold" }}>
                          ₹{item.price * item.qty}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="bill-details">
                <div className="bill-row">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Fee</span>
                  <span>₹{delivery}</span>
                </div>
                <div className="bill-row">
                  <span>Store Discount</span>
                  <span style={{ color: "#27ae60" }}>- ₹{discount}</span>
                </div>
                <div className="bill-row total">
                  <span>To Pay</span>
                  <span>₹{total}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="submit-btn"
              onClick={placeOrder}
            >
              Confirm &amp; Place Order
            </button>
          </div>
        </div>

        <div className="contact-info">
          <div className="info-box">
            <div className="feature-icon">⚡</div>
            <h3>30 Mins Delivery</h3>
            <p>We ensure your food arrives hot and fresh.</p>
          </div>
          <br />
          <div className="info-box">
            <div className="feature-icon">📍</div>
            <h3>Delivery Areas</h3>
            <p>
              College Square
              <br />
              Main Road
              <br />
              Palace Garden
              <br />
              Station Road
            </p>
          </div>
          <br />
          <div className="info-box">
            <h3>Delivery Charges</h3>
            <p>
              Orders above ₹500: <strong>FREE</strong>
            </p>
            <p>
              Orders below ₹500: <strong>₹40</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

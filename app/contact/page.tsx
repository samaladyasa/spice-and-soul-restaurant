"use client";
import { useState, FormEvent } from "react";
import { useNotification } from "@/components/Notification";
import { sendReservation } from "@/libs/api";

export default function ContactPage() {
  const showNotification = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupError, setPopupError] = useState(false);

  function validatePhone(phone: string) {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { name, email, phone, date, time, guests, requests } = formData;

    if (!name || !email || !phone || !date || !time || !guests) {
      showError("Please fill in all required fields");
      return;
    }

    if (!validatePhone(phone)) {
      showError("Invalid phone number");
      return;
    }

    setSubmitting(true);

    try {
      const data = await sendReservation({ name, email, phone, date, time, guests: Number(guests), requests });

      if (data.success) {
        const reservation = {
          id: "RES-" + Date.now(),
          name,
          phone,
          date,
          time,
          guests,
          requests,
          status: "Confirmed",
          createdAt: new Date().toLocaleDateString(),
        };

        const reservations = JSON.parse(
          localStorage.getItem("reservations") || "[]"
        );
        reservations.push(reservation);
        localStorage.setItem("reservations", JSON.stringify(reservations));

        showConfirmation(name, date, time, guests, phone);
        setFormData({
          name: "",
          email: "",
          phone: "",
          date: "",
          time: "",
          guests: "",
          requests: "",
        });
      } else {
        showError(data.message || "Failed to confirm reservation");
      }
    } catch {
      showError("Failed to send confirmation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function showError(message: string) {
    setPopupError(true);
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  }

  function showConfirmation(
    name: string,
    date: string,
    time: string,
    guests: string,
    phone: string
  ) {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setPopupError(false);
    setPopupMessage(
      `Your reservation for ${guests} ${
        guests === "1" ? "person" : "people"
      } on ${formattedDate} at ${time} is confirmed!<br/><br/>📞 <strong>We will call ${phone} shortly to confirm your booking.</strong><br/><br/>Thank you, ${name}! We look forward to serving you!`
    );
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 6000);
  }

  return (
    <>
      <section className="contact-header">
        <h2>Reserve Your Table</h2>
        <p>
          Join us for an unforgettable dining experience. Book your spot today!
        </p>
      </section>

      <div className="contact-container">
        <div className="contact-form-card">
          <h3>Make a Reservation</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address (for booking confirmation) *</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Number of Guests</label>
              <select
                required
                value={formData.guests}
                onChange={(e) =>
                  setFormData({ ...formData, guests: e.target.value })
                }
              >
                <option value="">Select Guests</option>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5 People</option>
                <option value="6">6+ (Large Group)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Special Requests (Optional)</label>
              <textarea
                placeholder="Allergies, birthday, anniversary, etc."
                rows={3}
                value={formData.requests}
                onChange={(e) =>
                  setFormData({ ...formData, requests: e.target.value })
                }
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </div>

        <div className="contact-info">
          <div className="info-box">
            <h3>📍 Visit Us</h3>
            <p>
              Near College Square, Main Road
              <br />
              Bhawanipatna, Odisha 766001
            </p>
          </div>

          <div className="info-box" style={{ marginTop: "20px" }}>
            <h3>📞 Call Us</h3>
            <p>
              +91 98765 43210
              <br />
              06670 234 567
            </p>
          </div>

          <div className="info-box" style={{ marginTop: "20px" }}>
            <h3>⏰ Opening Hours</h3>
            <p>Mon - Sun: 11:00 AM - 11:00 PM</p>
          </div>
        </div>
      </div>

      <div
        className={`popup-overlay${showPopup ? " show" : ""}`}
        onClick={() => setShowPopup(false)}
      ></div>
      <div
        className={`confirmation-popup${showPopup ? " show" : ""}`}
        style={{
          background: popupError
            ? "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="popup-content">
          <div className="popup-icon">{popupError ? "✕" : "✓"}</div>
          <h3>
            {popupError ? "Invalid Details" : "Reservation Confirmed!"}
          </h3>
          <p dangerouslySetInnerHTML={{ __html: popupMessage }}></p>
          <button className="close-popup" onClick={() => setShowPopup(false)}>
            {popupError ? "Try Again" : "Close"}
          </button>
        </div>
      </div>
    </>
  );
}

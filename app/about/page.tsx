/* eslint-disable @next/next/no-img-element */
export default function AboutPage() {
  return (
    <>
      <div className="about-hero">
        <h1>Our Story</h1>
        <p>From a small kitchen to Bhawanipatna&apos;s favorite spot.</p>
      </div>

      <section className="about-container">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
            alt="Restaurant Interior"
          />
        </div>
        <div className="about-text">
          <h2>Tradition Meets Taste</h2>
          <p>
            Founded in 2020, Spice &amp; Soul started with a simple mission: to
            bring the authentic taste of home-cooked Indian meals to everyone. We
            believe that food is not just about eating; it&apos;s about sharing
            memories.
          </p>
          <br />
          <p>
            Our spices are hand-ground daily, and our vegetables are sourced from
            local farmers in Odisha. Whether you are craving a spicy mutton curry
            or a sweet gulab jamun, we promise a meal that touches your soul.
          </p>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Chefs</h2>
        <p>The masters behind the magic.</p>

        <div className="team-grid">
          <div className="team-card">
            <img
              src="https://snibbs.co/cdn/shop/articles/Pros_and_Cons_of_Being_a_Chef.jpg?v=1688650492"
              alt="Head Chef"
            />
            <div className="team-info">
              <h3>Rahul Mishra</h3>
              <p>Head Chef</p>
            </div>
          </div>

          <div className="team-card">
            <img
              src="https://aaft.com/blog/wp-content/uploads/2024/09/pikaso_texttoimage_Steps-to-Becoming-a-Professional-Chef-in-India-wom-1024x701.jpeg?auto=format&fit=crop&w=400&q=80"
              alt="Sous Chef"
            />
            <div className="team-info">
              <h3>Priya Das</h3>
              <p>Curry Specialist</p>
            </div>
          </div>

          <div className="team-card">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0rpjb_j-jTuQ3onR-zFmB5Ad6CYb7DSLy1w&s=10"
              alt="Pastry Chef"
            />
            <div className="team-info">
              <h3>Amit Singh</h3>
              <p>Tandoor Master</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

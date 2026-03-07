/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getMenu } from "@/libs/api";

interface MenuItem {
  name: string;
  price: number;
  img: string;
  alt: string;
  rating: string;
  desc: string;
  categories: string[];
  section?: string;
}

const starters: MenuItem[] = [
  { name: "Paneer Tikka", price: 150, img: "https://nutriscan.app/calories-nutrition/images/paneer-tikka-9edc8.webp", alt: "Paneer Tikka", rating: "★★★★★ 4.8", desc: "Grilled cottage cheese with spices.", categories: ["veg"] },
  { name: "Dhokla", price: 80, img: "https://images.squarespace-cdn.com/content/v1/603bc7becf34a07d765fc033/1624339076432-XGNCDQPAU57MP47VYLUC/DSC00415.JPG", alt: "Dhokla", rating: "★★★★☆ 4.5", desc: "Steamed spongy gram flour cakes with mustard tempering.", categories: ["veg"] },
  { name: "Chicken Shawarma", price: 140, img: "https://preppykitchen.com/wp-content/uploads/2021/07/Chicken-Shawarma-Feature-1084x1536.jpg", alt: "Chicken Shawarma", rating: "★★★★☆ 4.6", desc: "Juicy grilled chicken wrapped in soft pita with garlic sauce.", categories: ["nonveg"] },
  { name: "Pani Puri", price: 40, img: "https://dy3rma73kowlp.cloudfront.net/uploads/2025/05/Pani-Puri-Recipe-2.png", alt: "Pani Puri", rating: "★★★★☆ 4.2", desc: "Crispy hollow balls filled with spicy tamarind water.", categories: ["veg"] },
  { name: "Hara Bhara Kebab", price: 120, img: "https://maharajaroyaldining.com/wp-content/uploads/2024/03/Hara-Bhara-Kabab-4.webp", alt: "Hara Bhara Kebab", rating: "★★★★☆ 4.5", desc: "Crispy spinach/pea patties with spices.", categories: ["veg"] },
  { name: "Honey Chilli Potato", price: 100, img: "https://rakskitchen.net/wp-content/uploads/2022/07/honey-chilli.jpg", alt: "Honey Chilli Potato", rating: "★★★★★ 4.7", desc: "Crispy fried potato fingers tossed in sesame honey sauce.", categories: ["veg"] },
  { name: "Chicken 65", price: 160, img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80", alt: "Chicken 65", rating: "★★★★☆ 4.4", desc: "Spicy, deep-fried chicken bites.", categories: ["nonveg"] },
  { name: "Mutton Seekh Kebab", price: 180, img: "https://orders.popskitchen.in/storage/2024/09/image-337-765x558.png", alt: "Mutton Seekh Kebab", rating: "★★★★★ 4.9", desc: "Minced lamb grilled on skewers.", categories: ["nonveg"] },
  { name: "Tandoori Chicken", price: 220, img: "https://www.kitchensanctuary.com/wp-content/uploads/2025/07/Tandoori-Chicken-Square-FS.jpg", alt: "Tandoori Chicken", rating: "★★★★★ 5.0", desc: "Whole chicken roasted in clay oven.", categories: ["nonveg", "signature"] },
];

const mains: MenuItem[] = [
  { name: "Chicken Biryani", price: 160, img: "https://t3.ftcdn.net/jpg/06/08/84/24/360_F_608842413_hdYadp6uSC7c7pq6LJew9s8gPnRSgjln.jpg", alt: "Chicken Biryani", rating: "★★★★★ 4.9", desc: "Aromatic rice with tender chicken.", categories: ["nonveg", "signature"] },
  { name: "Chicken Ramen", price: 200, img: "https://www.halfbakedharvest.com/wp-content/uploads/2021/10/Easy-Ginger-Chicken-and-Spinach-Ramen-1.jpg", alt: "Chicken Ramen", rating: "★★★★★ 4.8", desc: "Japanese noodle soup with grilled chicken, egg, and nori.", categories: ["nonveg"] },
  { name: "Butter Chicken", price: 180, img: "https://masalaandchai.com/wp-content/uploads/2022/03/Butter-Chicken.jpg", alt: "Butter Chicken", rating: "★★★★☆ 4.6", desc: "Chicken in creamy tomato gravy.", categories: ["nonveg"] },
  { name: "Veg Dum Biryani", price: 130, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80", alt: "Veg Dum Biryani", rating: "★★★★☆ 4.3", desc: "Basmati rice slow-cooked with mixed vegetables.", categories: ["veg"] },
  { name: "Veg Ramen", price: 180, img: "https://cdn.loveandlemons.com/wp-content/uploads/2023/02/vegan-ramen-recipe.jpg", alt: "Veg Ramen", rating: "★★★★☆ 4.7", desc: "Japanese noodle soup with tofu, corn, and fresh vegetables.", categories: ["veg"] },
  { name: "Chole Masala", price: 100, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu_sERKtKvive2uwKwMceaDFM8pIH6TDNrXwJZOhcRdxdxkDn_yK8A6L-a&s=1024x1024", alt: "Chole Masala", rating: "★★★★☆ 4.2", desc: "Spicy and tangy chickpea curry.", categories: ["veg"] },
  { name: "Paneer Butter Masala", price: 140, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80", alt: "Paneer Butter Masala", rating: "★★★★★ 4.8", desc: "Cubes of cottage cheese in tomato butter gravy.", categories: ["veg"] },
  { name: "Veg Hakka Noodles", price: 110, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6jK2hwSTu3r2MHmK9v2ToOVsA2M5b2ghq4LfnDWXcCY-adRFeizQVnA&s=1024x1024", alt: "Veg Hakka Noodles", rating: "★★★★☆ 4.1", desc: "Stir-fried noodles with fresh crunchy vegetables.", categories: ["veg"] },
  { name: "Dal Makhani", price: 130, img: "https://i.pinimg.com/736x/82/bb/b9/82bbb93fab74455c48029094a096a2d5.jpg", alt: "Dal Makhani", rating: "★★★★★ 4.9", desc: "Black lentils slow-cooked overnight.", categories: ["veg", "signature"] },
  { name: "Masala Dosa", price: 70, img: "https://i.pinimg.com/736x/65/ba/bf/65babfa10a37ee049e6b556f672103e5.jpg", alt: "Masala Dosa", rating: "★★★★★ 4.7", desc: "Crispy crepe with potato filling.", categories: ["veg"] },
  { name: "Spicy Mutton Curry", price: 220, img: "https://foodmahal.in/wp-content/uploads/2024/10/pexels-prabal-9609849-scaled.jpg", alt: "Spicy Mutton Curry", rating: "★★★★★ 5.0", desc: "Slow-cooked goat meat with robust spices.", categories: ["nonveg"] },
];

const breads: MenuItem[] = [
  { name: "Garlic Naan", price: 35, img: "https://img.freepik.com/free-photo/top-view-pakistani-meal-arrangement_23-2148825100.jpg?semt=ais_hybrid&w=740&q=80", alt: "Garlic Naan", rating: "★★★★☆ 4.5", desc: "Soft flatbread with garlic.", categories: ["breads", "veg"] },
  { name: "Tandoori Roti", price: 15, img: "https://media.istockphoto.com/id/1150376593/photo/bread-tandoori-indian-cuisine.jpg?s=612x612&w=0&k=20&c=GGT5LN7G4zLhJTEnP_KcyvYuayi8f1nJcvQwvmj0rCM=", alt: "Tandoori Roti", rating: "★★★★☆ 4.0", desc: "Whole wheat flatbread.", categories: ["breads", "veg"] },
  { name: "Butter Roti", price: 20, img: "https://orders.popskitchen.in/storage/2024/09/image-61.png", alt: "Butter Roti", rating: "★★★★☆ 4.3", desc: "Whole wheat flatbread brushed with butter.", categories: ["breads", "veg"] },
  { name: "Aloo Paratha", price: 30, img: "https://shivanilovesfood.com/wp-content/uploads/2024/03/Aloo-Paratha-13.jpg", alt: "Aloo Paratha", rating: "★★★★★ 4.8", desc: "Whole wheat flatbread stuffed with spiced potatoes.", categories: ["breads", "veg"] },
];

const desserts: MenuItem[] = [
  { name: "Gulab Jamun", price: 40, img: "https://t4.ftcdn.net/jpg/17/66/19/25/360_F_1766192554_nIkLqTxmiSbvbks2ohJMp9ux3ApZmVil.jpg", alt: "Gulab Jamun", rating: "★★★★★ 4.9", desc: "Fried milk solids in sugar syrup.", categories: ["dessert", "veg", "signature"] },
  { name: "Ice Cream Sundae", price: 60, img: "https://dinnerthendessert.com/wp-content/uploads/2021/02/Ice-Cream-Sundae-2.jpg", alt: "Ice Cream Sundae", rating: "★★★★★ 4.7", desc: "Scoops of vanilla and chocolate.", categories: ["dessert", "veg"] },
  { name: "Vanilla Custard Ice Cream", price: 80, img: "https://curlygirlkitchen.com/wp-content/uploads/2025/06/Baileys-Irish-Cream-Chocolate-Chip-Ice-Cream-Homemade-Frozen-Custard-008.jpg", alt: "Vanilla Custard Ice Cream", rating: "★★★★★ 4.8", desc: "Rich and creamy vanilla bean custard.", categories: ["dessert", "veg"] },
  { name: "Cotton Candy Ice Cream", price: 90, img: "https://bigfamilyblessings.com/wp-content/uploads/2020/07/2020-07-13_0001.jpg", alt: "Cotton Candy Ice Cream", rating: "★★★★★ 4.7", desc: "Sweet pink and blue spun sugar flavor.", categories: ["dessert", "veg"] },
  { name: "Kheer", price: 90, img: "https://sinfullyspicy.com/wp-content/uploads/2021/08/4-2.jpg", alt: "Kheer", rating: "★★★★★ 4.8", desc: "Traditional rice pudding with nuts and saffron.", categories: ["dessert", "veg"] },
  { name: "Blueberry Cheesecake", price: 150, img: "https://bakerbynature.com/wp-content/uploads/2016/08/untitled-82-of-131.jpg", alt: "Blueberry Cheesecake", rating: "★★★★★ 4.9", desc: "Creamy cheesecake topped with blueberry compote.", categories: ["dessert", "veg"] },
  { name: "Jalebi", price: 60, img: "https://www.flourandspiceblog.com/wp-content/uploads/2022/04/IMG_7302.jpg", alt: "Jalebi", rating: "★★★★★ 4.6", desc: "Crispy spirals soaked in saffron sugar syrup.", categories: ["dessert", "veg"] },
  { name: "Sizzling Brownie", price: 90, img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400&q=80", alt: "Brownie", rating: "★★★★★ 4.8", desc: "Warm chocolate fudge brownie.", categories: ["dessert", "veg"] },
  { name: "Choco Lava Cake", price: 95, img: "https://daddysbakery.in/wp-content/uploads/2019/01/Choco-Lava-Cake.jpg", alt: "Choco Lava Cake", rating: "★★★★★ 4.9", desc: "Molten chocolate center cake.", categories: ["dessert", "veg"] },
];

const drinks: MenuItem[] = [
  { name: "Mango Lassi", price: 50, img: "https://t4.ftcdn.net/jpg/13/03/11/35/360_F_1303113527_aS5oFQmaT32InDff5FEA4ecas4KylYC3.jpg", alt: "Mango Lassi", rating: "★★★★★ 4.9", desc: "Refreshing yogurt mango drink.", categories: ["drinks", "veg"] },
  { name: "Masala Chai", price: 20, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHR6mFLFuUrW0k4VgETvJ62aQaQ1XuokIY5yuDXwTeCaCYBk3MdK7QkYw&s=1024x1024", alt: "Masala Chai", rating: "★★★★★ 4.6", desc: "Aromatic spiced tea with ginger and cardamom.", categories: ["drinks", "veg"] },
  { name: "Blue Lagoon", price: 70, img: "https://menumaster.co.in/wp-content/uploads/2024/12/Blue-Lagoon-scaled-e1727253074606.jpg", alt: "Blue Lagoon", rating: "★★★★☆ 4.4", desc: "Refreshing blue curacao lemonade with a citrus twist.", categories: ["drinks", "veg"] },
  { name: "Virgin Mojito", price: 70, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80", alt: "Virgin Mojito", rating: "★★★★★ 4.7", desc: "Cool mint and lime mocktail with a fizzy splash.", categories: ["drinks", "veg"] },
];

const defaultSections = [
  { id: "starters", title: "Starters & Appetizers", items: starters },
  { id: "mains", title: "Main Courses", items: mains },
  { id: "breads", title: "Indian Breads", items: breads },
  { id: "desserts", title: "Desserts", items: desserts },
  { id: "drinks-section", title: "Drinks", items: drinks },
];

const sectionMeta: Record<string, { id: string; title: string }> = {
  starters: { id: "starters", title: "Starters & Appetizers" },
  mains: { id: "mains", title: "Main Courses" },
  breads: { id: "breads", title: "Indian Breads" },
  desserts: { id: "desserts", title: "Desserts" },
  drinks: { id: "drinks-section", title: "Drinks" },
};

function MenuCard({ item }: { item: MenuItem }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const cartItem = cart.find((c) => c.name === item.name);
  const qty = cartItem?.qty || 0;

  return (
    <div className={`card menu-item ${item.categories.join(" ")}`}>
      <img src={item.img} alt={item.alt} />
      <h3>{item.name}</h3>
      <div className="rating">{item.rating}</div>
      <p>{item.desc}</p>
      <span className="price">
        ₹{item.price}{" "}
        {qty === 0 ? (
          <button
            className="btn-add"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item.name, item.price);
            }}
          >
            Add +
          </button>
        ) : (
          <div className="quantity-controls">
            <button
              className="qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeFromCart(item.name);
              }}
            >
              −
            </button>
            <span className="qty-display">{qty}</span>
            <button
              className="qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item.name, item.price);
              }}
            >
              +
            </button>
          </div>
        )}
      </span>
    </div>
  );
}

export default function ServicesPage() {
  const { totalItems, totalPrice } = useCart();
  const [activeFilter, setActiveFilter] = useState("all");
  const [allSections, setAllSections] = useState(defaultSections);
  const [menuReady, setMenuReady] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const data = await getMenu();
        if (data.success && data.items && data.items.length > 0) {
          const grouped: Record<string, MenuItem[]> = {};
          for (const item of data.items) {
            const sec = item.section || "starters";
            if (!grouped[sec]) grouped[sec] = [];
            grouped[sec].push(item);
          }
          const sectionOrder = ["starters", "mains", "breads", "desserts", "drinks"];
          const sections = sectionOrder
            .filter((key) => grouped[key])
            .map((key) => ({
              id: sectionMeta[key]?.id || key,
              title: sectionMeta[key]?.title || key,
              items: grouped[key],
            }));
          for (const key of Object.keys(grouped)) {
            if (!sectionOrder.includes(key)) {
              sections.push({
                id: sectionMeta[key]?.id || key,
                title: sectionMeta[key]?.title || key,
                items: grouped[key],
              });
            }
          }
          setAllSections(sections);
        }
      } catch {
      } finally {
        setMenuReady(true);
      }
    }
    fetchMenu();
  }, []);

  const filters = [
    { key: "all", label: "All" },
    { key: "signature", label: "Chef's Specials" },
    { key: "veg", label: "Veg" },
    { key: "nonveg", label: "Non-Veg" },
    { key: "breads", label: "Breads" },
    { key: "dessert", label: "Desserts" },
    { key: "drinks", label: "Drinks" },
  ];

  const filterToSectionMap: Record<string, string> = {
    breads: "breads",
    dessert: "desserts",
    drinks: "drinks",
  };

  const isItemVisible = (item: MenuItem) => {
    if (activeFilter === "all") return true;
    if (item.categories && item.categories.includes(activeFilter)) return true;
    const matchSection = filterToSectionMap[activeFilter];
    if (matchSection && item.section === matchSection) return true;
    return false;
  };

  const isSectionVisible = (items: MenuItem[]) => {
    return items.some(isItemVisible);
  };

  return (
    <>
      <section className="page-content">
        <h2>Our Delicious Menu</h2>

        <div className="menu-filters">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-btn${activeFilter === f.key ? " active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!menuReady ? (
          <div className="menu-loading">
            <div className="service-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-text" style={{ width: "60%", margin: "14px auto 6px" }} />
                  <div className="skeleton-text" style={{ width: "40%", margin: "0 auto 8px" }} />
                  <div className="skeleton-text" style={{ width: "80%", margin: "0 auto 14px" }} />
                </div>
              ))}
            </div>
          </div>
        ) : allSections.map((section) => (
          <div
            key={section.id}
            className="menu-category"
            id={section.id}
            style={{
              display: isSectionVisible(section.items) ? "block" : "none",
            }}
          >
            <h3 className="category-title">{section.title}</h3>
            <div className="service-grid">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: isItemVisible(item) ? "block" : "none",
                  }}
                >
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {totalItems > 0 && (
        <div id="stickyCart" className="sticky-cart" style={{ display: "flex" }}>
          <div className="cart-info">
            <span id="cartCount">{totalItems} Items</span> |{" "}
            <span id="cartTotal" className="cart-total">
              ₹{totalPrice}
            </span>
          </div>
          <Link href="/delivery" className="btn-view-cart">
            View Cart &rarr;
          </Link>
        </div>
      )}
    </>
  );
}

# 🔍 Lay's Premium

A multi-page e-commerce frontend built using **Vanilla HTML, CSS, and JavaScript**.
Includes product browsing, cart, checkout flow, order tracking, and user account UI.

---

## 🚀 Features

* Homepage with hero, products, and reviews
* Shop page with search, filter, and sorting
* Product detail page (size, quantity, add-to-cart)
* Cart system (client-side)
* 3-step checkout flow
* Order tracking page
* Login/Register UI + account dashboard
* Fully responsive (mobile optimized)
* SEO-ready (meta tags, sitemap, robots.txt)

---

## 🛠 Tech Stack

* HTML5
* CSS3 (custom design system)
* Vanilla JavaScript
* Vercel (deployment)

---

## 📁 Project Structure

```
├── index.html        # Homepage
├── shop.html         # Shop page
├── product.html      # Product details
├── checkout.html     # Checkout flow
├── order.html        # Order tracking
├── account.html      # User account

├── styles.css        # Design system & styling

├── cart.js           # Cart + product data
├── script.js         # Homepage logic
├── shop.js           # Shop logic
├── product.js        # Product logic
├── checkout.js       # Checkout logic
├── order.js          # Order tracking
├── account.js        # Auth UI logic

├── img/              # Product images
├── vercel.json       # Deployment config
├── sitemap.xml       # SEO
└── robots.txt        # SEO
```

---

## ▶️ Run Locally

```bash
npm install -g http-server
http-server
```

Open:

```
http://localhost:8080
```

---

## 🌐 Deployment

Deployed using Vercel:

```bash
vercel
```

---

## ⚠️ Limitations

This is a **frontend-only project**:

* No backend
* No database
* No real authentication
* Cart and orders are not persistent

---

## 📌 Next Steps (If You’re Serious)

* Add backend (Node.js / Express)
* Integrate database (MongoDB / MySQL)
* Implement real authentication (JWT)
* Store users, cart, and orders
* Improve performance (lazy loading, bundling)

---

## 📄 License

This project is for educational and portfolio use.

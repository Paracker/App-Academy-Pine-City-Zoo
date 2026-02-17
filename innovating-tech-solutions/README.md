# Innovating Tech Solutions - E-Commerce Platform

A modern e-commerce platform for tech repair services and accessories in Alberton, Gauteng.

## Features

### Core Features
- 🏠 **Professional Homepage** - Showcasing all services and products
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional design with Tailwind CSS

### E-Commerce
- 🛒 **Shopping Cart** - Add products, adjust quantities, persistent storage
- 💳 **Multiple Payment Methods** - Stripe card payments & Cash on Delivery
- 📦 **Product Catalog** - Browse and purchase tech accessories
- ✅ **Order Management** - Track orders with unique order numbers

### Service Booking
- 📅 **Service Booking System** - Schedule appointments with date/time picker
- 🚗 **Call-Out Services** - Book on-site repairs at your location
- 🛠️ **Multiple Services** - Cellphone repairs, computer maintenance, CCTV, web services

### User Management
- 🔐 **User Authentication** - Secure sign up/sign in with NextAuth.js
- 👤 **User Dashboard** - View order history and service bookings
- 🔒 **Protected Routes** - Secure access to user-specific pages

### Admin Features
- 📊 **Admin Dashboard** - Overview of products, services, orders, and bookings
- 🎛️ **API Management** - RESTful APIs for all operations

### Services Offered
- 📱 Cellphone Repairs (screen replacements, battery changes, etc.)
- 💻 Computer Maintenance (hardware upgrades, software fixes)
- 📹 CCTV Camera Installation
- 🚗 Call-Out Repairs (we come to you!)
- 🌐 Website Development
- 🔒 Website Security Services

### Products Available
- LCD Screens
- Charging Cables & Pins
- Screen Protectors
- Phone Cases & Accessories

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **State Management:** React Context API

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

3. Set up the database:
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

6. Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin)

## Project Structure

```
innovating-tech-solutions/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable components (to be added)
├── lib/                   # Utility functions (to be added)
├── public/                # Static assets
└── package.json           # Dependencies
```

## Roadmap

### Phase 1 ✅
- [x] Project setup
- [x] Homepage with services showcase
- [x] Responsive design

### Phase 2 ✅
- [x] Database integration (PostgreSQL + Prisma)
- [x] Product catalog with API
- [x] Shopping cart functionality
- [x] Service booking system API
- [x] Order management API
- [x] Payment method selection (Stripe + Cash on Delivery)
- [x] Admin dashboard basics

### Phase 3 ✅
- [x] User authentication (NextAuth.js with email/password)
- [x] Sign up and sign in pages
- [x] User dashboard (view orders & bookings)
- [x] Stripe payment integration (checkout & webhooks)
- [x] Service booking UI with date/time picker
- [x] Protected routes for authenticated users
- [x] Payment success page

### Phase 4 (In Progress)
- [x] Email notifications infrastructure (Nodemailer)
- [x] Order confirmation emails
- [x] Booking confirmation emails
- [x] Order status update emails
- [x] Booking reminder emails
- [x] Low stock alert emails
- [x] Customer reviews and ratings API
- [x] Advanced inventory tracking (stock history)
- [x] Automatic stock updates on orders
- [ ] Admin product/service management UI
- [ ] Order status tracking UI
- [ ] Review display on product pages
- [ ] Technician dispatch system
- [ ] Push notifications

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

## License

Private - Innovating Tech Solutions © 2024

# Innovating Tech Solutions - E-Commerce Platform

A modern e-commerce platform for tech repair services and accessories in Alberton, Gauteng.

## Features

### Services
- 📱 Cellphone Repairs (screen replacements, battery changes, etc.)
- 💻 Computer Maintenance (hardware upgrades, software fixes)
- 📹 CCTV Camera Installation
- 🚗 Call-Out Repairs (we come to you!)
- 🌐 Website Development
- 🔒 Website Security Services

### Products
- LCD Screens
- Charging Cables & Pins
- Screen Protectors
- Phone Cases & Accessories

### Payment Options
- 💳 Online Card Payments (Stripe)
- 💵 Cash on Delivery

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** PostgreSQL (to be added)
- **ORM:** Prisma (to be added)
- **Payments:** Stripe (to be integrated)

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

### Phase 3 (Next)
- [ ] User authentication (NextAuth.js)
- [ ] Stripe payment integration
- [ ] Service detail pages
- [ ] Booking calendar UI
- [ ] Email notifications
- [ ] Customer reviews
- [ ] Inventory tracking
- [ ] Technician dispatch system

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

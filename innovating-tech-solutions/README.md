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

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

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

### Phase 1 (Current)
- [x] Project setup
- [x] Homepage with services showcase
- [x] Responsive design
- [ ] Service detail pages
- [ ] Product catalog
- [ ] Shopping cart

### Phase 2
- [ ] Database integration (PostgreSQL + Prisma)
- [ ] User authentication
- [ ] Booking system
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard

### Phase 3
- [ ] Order management
- [ ] Inventory tracking
- [ ] Email notifications
- [ ] Customer reviews
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


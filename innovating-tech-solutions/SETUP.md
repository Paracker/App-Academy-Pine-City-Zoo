# 🚀 Innovating Tech Solutions - Setup Guide

Complete setup guide to get your e-commerce platform running locally.

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Paracker/App-Academy-Pine-City-Zoo.git
cd App-Academy-Pine-City-Zoo/innovating-tech-solutions
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- Prisma (database ORM)
- NextAuth (authentication)
- Stripe (payments)
- Nodemailer (emails)
- And more...

## Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. **Install PostgreSQL** if you haven't already
2. **Create a new database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE innovating_tech;

# Exit psql
\q
```

### Option B: Use a Cloud Database

You can also use services like:
- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/) (Free tier available)

## Step 4: Configure Environment Variables

1. **Copy the example environment file:**

```bash
cp .env.example .env
```

2. **Edit `.env` file with your configuration:**

```bash
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/innovating_tech"

# NextAuth - Generate a random secret
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe - Get from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Gmail example) - Optional for testing
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@innovatingtech.co.za"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"
```

### 🔑 How to Get API Keys:

**Stripe (Required for payments):**
1. Sign up at [stripe.com](https://stripe.com)
2. Go to [Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
3. Copy your **Publishable key** and **Secret key** (use TEST mode)
4. For webhook secret, see [Stripe Webhooks Setup](#stripe-webhooks-setup) below

**Gmail (Optional for emails):**
1. Enable 2-factor authentication on your Gmail account
2. Go to [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password in `SMTP_PASS`

**NextAuth Secret:**
Generate a random secret:
```bash
openssl rand -base64 32
```

## Step 5: Set Up the Database

Run Prisma migrations to create all database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

## Step 6: Seed the Database

Populate your database with sample data:

```bash
npm run seed
```

This will create:
- ✅ 3 test users (including admin)
- ✅ 4 product categories
- ✅ 13 products (phone accessories, repair parts, computer accessories, security equipment)
- ✅ 7 services (repairs, installations, website development)
- ✅ 3 sample orders with complete status history
- ✅ 3 sample bookings
- ✅ 3 product reviews

### 🔐 Test User Credentials:

After seeding, you can log in with:

| Email | Password | Role |
|-------|----------|------|
| admin@innovatingtech.co.za | password123 | Admin |
| customer@example.com | password123 | Customer |
| jane@example.com | password123 | Customer |

## Step 7: Start the Development Server

```bash
npm run dev
```

Your application will be available at: **http://localhost:3000**

## Step 8: Test the Application

### Customer Flow:
1. Visit http://localhost:3000
2. Sign in with `customer@example.com` / `password123`
3. Browse products at `/shop`
4. Add items to cart
5. Checkout and complete payment (use test card: `4242 4242 4242 4242`)
6. View your order in dashboard
7. Track order status at `/orders/[id]`

### Admin Flow:
1. Sign in with `admin@innovatingtech.co.za` / `password123`
2. Visit `/admin` dashboard
3. Manage products at `/admin/products`
4. Manage orders at `/admin/orders`
5. Update order statuses and see email notifications

## Stripe Webhooks Setup

For payment confirmations to work properly:

### Local Development (using Stripe CLI):

1. **Install Stripe CLI:**
   - [Download Stripe CLI](https://stripe.com/docs/stripe-cli)

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** shown in the terminal and add it to your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### Production:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`
5. Copy the signing secret to your production environment variables

## Database Management

### View Database with Prisma Studio:

```bash
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can:
- View all tables
- Edit data
- Run queries
- Inspect relationships

### Reset Database:

If you need to start fresh:

```bash
# Reset database and re-run migrations
npx prisma migrate reset

# Seed again
npm run seed
```

## Email Testing

### Without SMTP Configuration:

If you don't configure SMTP, emails will be logged to the console. Check your terminal for email content.

### With SMTP Configuration:

Emails will be sent to actual email addresses. Great for testing the full flow!

## Troubleshooting

### Database Connection Error:
```
Error: Can't reach database server
```
**Solution:** Make sure PostgreSQL is running and DATABASE_URL is correct.

### Prisma Client Error:
```
Error: @prisma/client did not initialize yet
```
**Solution:** Run `npx prisma generate`

### Port Already in Use:
```
Error: Port 3000 is already in use
```
**Solution:** Kill the process using port 3000 or use a different port:
```bash
PORT=3001 npm run dev
```

### Stripe Payment Fails:
**Solution:** 
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Make sure you're using TEST mode API keys

### Emails Not Sending:
**Solution:**
- Check SMTP credentials
- For Gmail, use App Password (not regular password)
- Emails will log to console if SMTP not configured

## Project Structure

```
innovating-tech-solutions/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout flow
│   ├── dashboard/         # User dashboard
│   ├── orders/            # Order tracking
│   ├── services/          # Service booking
│   └── shop/              # Product catalog
├── components/            # React components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── email.ts          # Email service
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── public/               # Static files
└── .env                  # Environment variables
```

## Next Steps

Now that your platform is running:

1. ✅ **Test all features** using the testing checklist in the main README
2. ✅ **Customize branding** - Update colors, logo, and content
3. ✅ **Add real products** - Replace sample data with your actual inventory
4. ✅ **Configure email** - Set up SMTP for production
5. ✅ **Set up Stripe** - Configure payment processing
6. ✅ **Deploy** - Deploy to Vercel, Netlify, or your preferred host

## Support

If you encounter any issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the error messages in the terminal
3. Check the browser console for client-side errors
4. Inspect the database with Prisma Studio

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Happy coding! 🚀


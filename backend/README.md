# Marqato — Backend

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure .env
Fill in all values in the `.env` file:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/marqato"
PORT=5000
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_very_long_random_secret_here
ADMIN_EMAIL=admin@marqato.com
ADMIN_PASSWORD=your_strong_password
CHAPA_SECRET_KEY=CHASECK_TEST_xxxxxxxxxxxx
EMAIL_USER=heni1500896@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### 3. Setup database
```bash
npx prisma db push
```

### 4. Run
```bash
npm run dev       # development
npm start         # production
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/user/register | Register user |
| POST | /api/user/login | Login user |
| POST | /api/user/admin | Admin login |
| GET  | /api/product/list | Get all products |
| POST | /api/product/add | Add product (admin) |
| POST | /api/product/remove | Remove product (admin) |
| POST | /api/cart/get | Get user cart |
| POST | /api/cart/add | Add to cart |
| POST | /api/cart/update | Update cart |
| POST | /api/order/place | Place COD order |
| POST | /api/order/chapa | Initialize Chapa payment |
| GET  | /api/order/chapa/verify | Chapa payment callback |
| POST | /api/order/userorders | Get user orders |
| POST | /api/order/list | Get all orders (admin) |
| POST | /api/order/status | Update order status (admin) |

## Gmail App Password Setup
1. Go to myaccount.google.com
2. Search "App Passwords"
3. Create one → copy the 16-char code
4. Paste into EMAIL_APP_PASSWORD in .env

## Chapa Setup
1. Sign up at dashboard.chapa.co
2. Go to Settings → API Keys
3. Copy test key → paste into CHAPA_SECRET_KEY
4. When ready for live, swap for live key

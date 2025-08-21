# 🌱 AgriLink Lanka - Online Vegetable Export Platform

A comprehensive digital platform connecting Sri Lankan farmers with international buyers and exporters, built with modern web technologies.

## 🎯 Project Overview

AgriLink Lanka addresses the critical need for direct market access for Sri Lankan farmers by providing a digital bridge between local agricultural producers and global markets. The platform eliminates unnecessary middlemen, ensures quality verification, and streamlines the export process.

### Key Features

- **Farmer Portal**: List vegetables, manage inventory, track sales
- **Buyer Portal**: Browse products, place orders, manage purchases
- **Exporter Portal**: Handle logistics, customs, and international delivery
- **Admin Dashboard**: User management, quality verification, platform oversight
- **Secure Payments**: Stripe integration for international transactions
- **Email Notifications**: Automated alerts using Nodemailer
- **Quality Verification**: Product certification and inspection reports

## 🚀 Technology Stack

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication and authorization
- **Stripe** payment gateway integration
- **Nodemailer** for email services
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend

- **React.js** with modern hooks
- **React Router** for navigation
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Lucide React** for icons

### Infrastructure

- **MongoDB Atlas** (cloud database)
- **Vercel/Netlify** (frontend hosting)
- **Render/Heroku** (backend hosting)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AgriLink-Lanka-Web-Platform.git
cd AgriLink-Lanka-Web-Platform
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env

# Configure environment variables in .env file
# (See Configuration section below)

# Start development server
npm run dev

# For production
npm start
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Database Setup

#### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env` file to `mongodb://localhost:27017/agrilink-lanka`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agrilink-lanka

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=AgriLink Lanka <noreply@agrilinklanka.com>

# Admin Configuration
ADMIN_EMAIL=admin@agrilinklanka.com
ADMIN_PASSWORD=admin123
```

### Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from dashboard
3. Update environment variables
4. Configure webhooks for payment events

### Email Setup (Gmail)

1. Enable 2-factor authentication
2. Generate app-specific password
3. Update email configuration in `.env`

## 🏗️ Project Structure

```
AgriLink-Lanka-Web-Platform/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication & validation
│   ├── services/         # Business logic
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utility functions
│   │   └── App.js        # Main app component
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── docs/                 # Documentation
├── .env.example          # Environment template
└── README.md             # This file
```

## 🔐 Authentication & Authorization

### User Roles

- **Farmer**: Can list products, manage inventory, view orders
- **Buyer**: Can browse products, place orders, track shipments
- **Exporter**: Can handle logistics, manage export processes
- **Admin**: Can manage users, verify products, oversee platform

### Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting for API protection
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/me` - Update user profile

### Products

- `GET /api/products` - List all products (with filtering)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product (farmers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Remove product
- `POST /api/products/:id/inquiry` - Send product inquiry

### Orders

- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Admin

- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/verify` - Verify user account
- `PUT /api/admin/users/:id/approve-exporter` - Approve exporter
- `GET /api/admin/stats` - Platform statistics

## 🎨 UI Components

### Design System

- **Colors**: Primary (green), Secondary (yellow), Accent (blue)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Shadows**: Soft, medium, and large shadow variants
- **Animations**: Framer Motion for smooth interactions

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly interactions

## 🚀 Deployment

### Backend Deployment (Render)

1. Connect GitHub repository to Render
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Deploy

### Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Configure environment variables
5. Deploy

### Environment Variables for Production

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=your_production_stripe_key
```

## 🧪 Testing

### Backend Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📈 Monitoring & Analytics

### Performance Monitoring

- API response time tracking
- Database query optimization
- Frontend performance metrics
- Error logging and monitoring

### Business Analytics

- User registration trends
- Product listing statistics
- Order volume tracking
- Revenue analytics

## 🔒 Security Considerations

### Data Protection

- User data encryption
- Secure payment processing
- GDPR compliance measures
- Regular security audits

### API Security

- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)

### Contact

- **Email**: support@agrilinklanka.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/AgriLink-Lanka-Web-Platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/AgriLink-Lanka-Web-Platform/discussions)

## 🎉 Acknowledgments

- Sri Lankan farming community
- Open source contributors
- Agricultural experts and consultants
- Technology partners and sponsors

---

**Built with ❤️ for Sri Lankan Agriculture**

_Empowering farmers, connecting markets, building futures._

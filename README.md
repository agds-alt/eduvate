# Eduvate - Modern School Management System

![Eduvate Logo](https://via.placeholder.com/150x150?text=Eduvate)

> **Elevate Your Education** - A comprehensive, modern school management system built with Next.js, tRPC, and Prisma.

## 🎯 Overview

Eduvate is a production-ready school management system designed specifically for Indonesian schools. It provides a complete solution for managing students, teachers, attendance, academics, finances, and more.

### ✨ Key Features

- 👥 **Complete User Management** - Students, Teachers, Parents, Alumni
- 📊 **Dashboard & Analytics** - Real-time statistics and insights
- ✅ **Advanced Attendance** - Manual, Scanner, Biometric support
- 📝 **Academic Management** - Exams, Grades, Report Cards
- 💰 **Financial System** - SPP Billing, Payments, Payroll
- 📅 **Content Management** - Agenda, Gallery, Information, Holidays
- 🔒 **Role-Based Access** - Secure authentication & authorization
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Core
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Unstyled, accessible components
- **shadcn/ui** - Beautiful UI components
- **Lucide Icons** - Icon library

### State & Data
- **TanStack Query** - Data fetching & caching
- **NextAuth.js** - Authentication
- **Zod** - Runtime validation
- **React Hook Form** - Form management

## 📁 Project Structure

```
eduvate/
├── prisma/
│   └── schema.prisma          # Database schema (21 models)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── trpc/          # tRPC endpoint
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # tRPC client
│   │   └── trpc-provider.tsx  # tRPC provider
│   ├── server/                # Server-side code
│   │   ├── api/               # tRPC routers
│   │   │   ├── routers/       # Feature routers
│   │   │   ├── root.ts        # Root router
│   │   │   └── trpc.ts        # tRPC config
│   │   ├── auth/              # Auth configuration
│   │   └── db.ts              # Prisma client
│   └── styles/
│       └── globals.css        # Global styles
└── public/                    # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- PostgreSQL 14.x or later
- pnpm (recommended) or npm

### Installation

1. **Clone & Navigate**
   ```bash
   cd /DataPopOS/projects/eduvate
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

4. **Setup Database**
   ```bash
   # Push schema to database
   pnpm db:push

   # Or run migrations (production)
   pnpm db:migrate

   # Open Prisma Studio (optional)
   pnpm db:studio
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Core Entities (21 Models)

#### Authentication
- `User` - Core user model with role-based access
- `Account`, `Session`, `VerificationToken` - NextAuth.js models

#### School Management
- `School` - School profile & configuration
- `Teacher` - Teaching staff
- `Student` - Student enrollment
- `Parent` - Parent/Guardian information
- `StudentParent` - Student-Parent relationships

#### Academic
- `Class` - Grade levels & sections
- `Subject` - Curriculum subjects
- `ClassTeacher`, `ClassSubject` - Relationships
- `Exam` - Exam management
- `ExamResult` - Student exam scores
- `Grade` - Student grades & report cards

#### Attendance
- `Attendance` - Daily attendance records
  - Types: MANUAL, SCANNER, BIOMETRIC
  - Statuses: PRESENT, ABSENT, LATE, SICK, PERMISSION, EXCUSED

#### Financial
- `Finance` - Bills, payments, SPP management
  - Statuses: UNPAID, PARTIAL, PAID, OVERDUE

#### Content
- `Agenda` - School events & calendar
- `Gallery` - Photo gallery
- `Information` - Announcements & news
- `Holiday` - Holiday calendar

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
```

### Adding New Features

1. **Create Prisma Model** (if needed)
   ```prisma
   // prisma/schema.prisma
   model YourModel {
     id String @id @default(cuid())
     // ... fields
   }
   ```

2. **Generate Prisma Client**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

3. **Create tRPC Router**
   ```typescript
   // src/server/api/routers/your-feature.ts
   export const yourRouter = createTRPCRouter({
     getAll: publicProcedure.query(async ({ ctx }) => {
       return ctx.db.yourModel.findMany();
     }),
   });
   ```

4. **Add to Root Router**
   ```typescript
   // src/server/api/root.ts
   export const appRouter = createTRPCRouter({
     // ... other routers
     yourFeature: yourRouter,
   });
   ```

5. **Use in Components**
   ```typescript
   "use client";
   import { api } from "~/lib/trpc-provider";

   export function YourComponent() {
     const { data } = api.yourFeature.getAll.useQuery();
     // ...
   }
   ```

## 🎨 UI Components

Eduvate uses [shadcn/ui](https://ui.shadcn.com/) for UI components. To add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table
# etc.
```

## 🔐 Authentication

Authentication is handled by NextAuth.js v5 (Auth.js).

### Roles
- `SUPER_ADMIN` - Full system access
- `SCHOOL_ADMIN` - School-level administration
- `TEACHER` - Teacher access
- `STUDENT` - Student access
- `PARENT` - Parent/Guardian access

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

### Docker

```bash
# Build image
docker build -t eduvate .

# Run container
docker run -p 3000:3000 eduvate
```

## 🗺️ Roadmap

### Phase 1: Core Features (Current)
- ✅ Database Schema
- ✅ Authentication Setup
- ✅ tRPC Configuration
- ✅ Basic UI Structure
- 🚧 Dashboard Implementation
- 🚧 User Management

### Phase 2: Academic Features
- ⏳ Student Management
- ⏳ Teacher Management
- ⏳ Class & Subject Management
- ⏳ Exam Management
- ⏳ Grade & Report Card System

### Phase 3: Attendance System
- ⏳ Manual Attendance
- ⏳ QR/Barcode Scanner
- ⏳ Biometric Integration
- ⏳ Attendance Reports

### Phase 4: Financial Management
- ⏳ SPP Billing System
- ⏳ Payment Gateway Integration
- ⏳ Financial Reports
- ⏳ Payroll Management

### Phase 5: Content & Communication
- ⏳ Agenda & Calendar
- ⏳ Gallery Management
- ⏳ Announcements
- ⏳ Parent-Teacher Communication

### Phase 6: Advanced Features
- ⏳ Mobile App (React Native)
- ⏳ Advanced Analytics
- ⏳ AI-Powered Insights
- ⏳ WhatsApp Integration

## 📄 License

Copyright © 2026 Eduvate. All rights reserved.

## 🤝 Contributing

This is a commercial product. For collaboration inquiries, please contact the development team.

## 📧 Support

For support and inquiries:
- Email: support@eduvate.com
- Website: https://eduvate.com

---

**Built with ❤️ using the T3 Stack**

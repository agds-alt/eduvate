import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
              E
            </div>
            <span className="text-2xl font-bold">Eduvate</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Elevate Your School Management
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Eduvate is a modern, comprehensive school management system designed
              for Indonesian schools. Manage students, teachers, attendance,
              exams, finances, and more—all in one platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Start Free Trial
              </Link>
              <Link
                href="#demo"
                className="text-sm font-semibold leading-6 hover:text-primary"
              >
                Watch Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <div className="text-3xl font-bold text-primary">7+</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Core Feature Categories
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="text-3xl font-bold text-primary">20+</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Management Modules
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Type-Safe & Modern
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/40 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Complete School Management Solution
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to manage your school efficiently
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-5xl">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <div key={index} className="rounded-lg border bg-card p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to elevate your school?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join hundreds of schools already using Eduvate
              </p>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
                E
              </div>
              <span className="text-xl font-bold">Eduvate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Eduvate. Modern School Management System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "👥",
    title: "Student & Teacher Management",
    description:
      "Complete management for students, teachers, parents, and alumni with detailed profiles.",
  },
  {
    icon: "📊",
    title: "Dashboard & Analytics",
    description:
      "Real-time statistics and insights about your school's performance.",
  },
  {
    icon: "✅",
    title: "Advanced Attendance System",
    description:
      "Manual, scanner, and biometric attendance with detailed logs and reports.",
  },
  {
    icon: "📝",
    title: "Exam & Grade Management",
    description:
      "Create exams, record results, generate report cards automatically.",
  },
  {
    icon: "💰",
    title: "Financial Management",
    description:
      "SPP billing, payment tracking, payroll management, and financial reports.",
  },
  {
    icon: "📅",
    title: "Agenda & Calendar",
    description:
      "School events, holidays, and important dates in one centralized calendar.",
  },
  {
    icon: "📷",
    title: "Gallery & Information",
    description:
      "Share school photos, announcements, and news with the community.",
  },
  {
    icon: "🔒",
    title: "Role-Based Access",
    description:
      "Secure access control for admins, teachers, students, and parents.",
  },
  {
    icon: "📱",
    title: "Modern & Responsive",
    description:
      "Beautiful UI that works perfectly on desktop, tablet, and mobile devices.",
  },
];

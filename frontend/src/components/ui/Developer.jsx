import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail, Phone } from "lucide-react";

// Developer page component for Pradha Fashion Outlet
// Tailwind-based, production-ready layout.

export default function Developer() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Meet the Developer — <span className="text-[#8B1538]">NextGen_Tech</span>
          </h1>
          <p className="mt-3 text-slate-600">
            Behind every smooth click and secure checkout at <strong>Pradha Fashion Outlet</strong> is NextGen_Tech. We build fast, secure and delightful experiences using modern technologies.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold">About NextGen_Tech</h2>
              <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                <strong>NextGen_Tech</strong> is a full-stack developer focused on building scalable commerce experiences for Pradha Fashion Outlet. From initial localhost setup to production deployment on EC2, every challenge was tackled with precision - debugging CORS issues, implementing Google OAuth, optimizing mobile responsiveness, and adding advanced features like rental systems and customer feedback.
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                <li>🚀 Backend: Java Spring Boot + PostgreSQL</li>
                <li>⚛️ Frontend: React + Tailwind CSS</li>
                <li>☁️ Cloud: AWS EC2 + S3 + Docker</li>
                <li>🔐 Auth: JWT + Google OAuth + OTP verification</li>
                <li>📱 Mobile-first responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold">Key Features Built</h2>
              <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                From concept to production - we built a complete fashion e-commerce platform with advanced rental system, customer reviews, admin dashboard, and seamless mobile experience. Every feature was iteratively improved based on real-world needs.
              </p>

              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="rounded-full bg-[#8B1538]/10 px-3 py-1 text-[#8B1538] text-xs">Product Catalog</span>
                <span className="rounded-full bg-[#DAA520]/10 px-3 py-1 text-[#DAA520] text-xs">Rental System</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 text-xs">Customer Reviews</span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 text-xs">Admin Dashboard</span>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700 text-xs">Google OAuth</span>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700 text-xs">AWS S3 Storage</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card className="shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold">Integrations (Highlights)</h2>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <strong>WhatsApp Notifications (Twilio)</strong>
                  <p className="mt-2">
                    We use Twilio's WhatsApp Business API to send automated booking and order
                    notifications from the official Pradha Fashion Outlet WhatsApp business number.
                    Templates are Meta-approved and we only send transactional messages (booking
                    confirmations, shipping updates). Once a customer replies, we handle
                    conversational messages within the 24-hour session window.
                  </p>
                </div>

                <div>
                  <strong>Payments (Razorpay)</strong>
                  <p className="mt-2">
                    Payments are processed via Razorpay. We integrate using Razorpay's secure
                    checkout flow and webhooks. All payment events are verified server-side before
                    updating order status in PostgreSQL. We never store card data on our servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card className="shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold">Developer Tools & Best Practices</h2>
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-2">
                <li>CI/CD: Automated builds, tests and deployments (e.g., Jenkins / GitHub Actions)</li>
                <li>Monitoring: Application logs, health checks and alerts</li>
                <li>Security: Secrets management, TLS everywhere, OWASP hardening</li>
                <li>Testing: Unit, integration and end-to-end tests for critical flows</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card className="shadow-lg">
            <CardContent>
              <h2 className="text-xl font-semibold">Contact NextGen_Tech</h2>

              <p className="mt-3 text-slate-600 text-sm">For tech requests, integration queries or bug reports:</p>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                <a href="mailto:nextgen_tech@devmail.com" className="inline-flex items-center gap-2">
                  <Button variant="ghost" className="rounded-md">
                    <Mail size={16} />
                    <span className="ml-1 text-xs">nextgen_tech@devmail.com</span>
                  </Button>
                </a>

                <a href="#" className="inline-flex items-center gap-2">
                  <Button variant="ghost" className="rounded-md">
                    <Github size={16} />
                    <span className="ml-1 text-xs">GitHub / Portfolio</span>
                  </Button>
                </a>

                <a href="tel:+919900112233" className="inline-flex items-center gap-2">
                  <Button variant="ghost" className="rounded-md">
                    <Phone size={16} />
                    <span className="ml-1 text-xs">+91 99001 12233</span>
                  </Button>
                </a>
              </div>

              <p className="mt-6 text-xs text-slate-500 text-center">© {new Date().getFullYear()} Pradha Fashion Outlet — Developed by NextGen_Tech</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
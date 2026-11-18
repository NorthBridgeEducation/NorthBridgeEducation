
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  Globe2,
  BookOpen,
  Plane,
  ShieldCheck,
  Compass,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const destinations = [
  {
    name: "United Kingdom",
    code: "UK",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "United States",
    code: "USA",
    image:
      "https://images.unsplash.com/photo-1498892158567-9eecf6f6b6e1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Canada",
    code: "CA",
    image:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Australia",
    code: "AU",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Germany",
    code: "DE",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Japan",
    code: "JP",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85",
  },
];

const services = [
  {
    icon: Compass,
    title: "University Guidance",
    description:
      "Find universities and courses that match your academic background and goals.",
  },
  {
    icon: BookOpen,
    title: "Admission Assistance",
    description:
      "Get support throughout your university application and admission process.",
  },
  {
    icon: ShieldCheck,
    title: "Visa Guidance",
    description:
      "Understand visa requirements and prepare the necessary documents.",
  },
  {
    icon: Sparkles,
    title: "Scholarship Guidance",
    description:
      "Explore scholarship opportunities and possible funding options.",
  },
  {
    icon: MessageCircle,
    title: "Personal Consultation",
    description:
      "Discuss your plans with our team and get guidance for your next step.",
  },
  {
    icon: Plane,
    title: "Pre-departure Support",
    description:
      "Get prepared for your international education journey.",
  },
];

const steps = [
  {
    number: "01",
    title: "Share your goals",
    description:
      "Tell us about your education, interests and preferred destination.",
  },
  {
    number: "02",
    title: "Explore your options",
    description:
      "Discover universities, courses and suitable study pathways.",
  },
  {
    number: "03",
    title: "Apply with confidence",
    description:
      "Prepare your application and required documents with guidance.",
  },
  {
    number: "04",
    title: "Prepare to travel",
    description:
      "Get ready for your visa process and international journey.",
  },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-[#153b63] text-white">
        <img
            src="/pwa-192x192.png"
            alt="NBridge"
            className="size-10 rounded-lg object-contain"
        />
      </div>

      <div className="leading-tight">
        <p className="text-xl font-bold tracking-tight text-[#122c46]">
          NBridge
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Global Education
        </p>
      </div>
    </Link>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#destinations"
            className="text-sm font-medium text-slate-600 transition hover:text-[#153b63]"
          >
            Destinations
          </a>
          <a
            href="#services"
            className="text-sm font-medium text-slate-600 transition hover:text-[#153b63]"
          >
            Services
          </a>
          <a
            href="#process"
            className="text-sm font-medium text-slate-600 transition hover:text-[#153b63]"
          >
            How it works
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition hover:text-[#153b63]"
          >
            About us
          </a>
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-[#153b63]"
          >
            Login
          </Link>

          <Link
            to="/get-started"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#153b63] px-5 text-sm font-semibold text-white transition hover:bg-[#102e4d]"
          >
            Apply Now
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex size-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 md:hidden"
        >
          {menuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {[
              ["Destinations", "#destinations"],
              ["Services", "#services"],
              ["How it works", "#process"],
              ["About us", "#about"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}

            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-sm font-semibold text-slate-700"
              >
                Login
              </Link>
              <Link
                to="/get-started"
                onClick={closeMenu}
                className="flex h-10 items-center justify-center rounded-md bg-[#153b63] text-sm font-semibold text-white"
              >
                Apply Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39749b]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#122c46] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="bg-[#f3f7fa]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#28577e]">
            <Globe2 className="size-4" />
            YOUR GLOBAL EDUCATION PARTNER
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight text-[#122c46] sm:text-5xl lg:text-6xl">
            Build your future through
            <span className="text-[#39749b]"> global education.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            Explore international study opportunities, discover universities
            and get personal guidance to make your education journey clearer.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/get-started"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#153b63] px-5 text-sm font-semibold text-white transition hover:bg-[#102e4d]"
            >
              Start Your Application
              <ArrowUpRight className="size-4" />
            </Link>

            <a
              href="#destinations"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-[#153b63] transition hover:bg-slate-50"
            >
              Explore Destinations
              <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="mt-9 grid max-w-lg grid-cols-1 gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3">
            {[
              "Personal guidance",
              "Clear application steps",
              "Student-first support",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85"
              alt="Students walking on a university campus"
              className="aspect-[5/4] w-full rounded-lg object-cover"
            />
          </div>

          <div className="absolute -bottom-5 left-5 rounded-lg border border-slate-200 bg-white p-4 shadow-lg sm:left-10">
            <p className="text-xs font-medium text-slate-500">
              YOUR NEXT CHAPTER
            </p>
            <p className="mt-1 text-base font-semibold text-[#153b63]">
              Starts with a plan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DestinationsSection() {
  return (
    <section
      id="destinations"
      className="scroll-mt-24 bg-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Study destinations"
            title="Explore where you can study."
            description="Discover different countries and explore the international education opportunities available to you."
          />

          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#24577f] hover:underline"
          >
            Find your destination
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((country) => (
            <Link
              to="/get-started"
              key={country.code}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="relative overflow-hidden bg-slate-100">
                <img
                  src={country.image}
                  alt={country.name}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-[#153b63] shadow-sm">
                  {country.code}
                </span>
              </div>

              <div className="flex items-center justify-between p-4">
                <h3 className="font-semibold text-[#173650]">
                  {country.name}
                </h3>
                <ArrowUpRight className="size-4 text-slate-400 transition group-hover:text-[#153b63]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section
      id="services"
      className="scroll-mt-24 border-y border-slate-200 bg-[#f8fafc] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our services"
          title="Support throughout your journey."
          description="From choosing a university to preparing for departure, get guidance at every important stage."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-[#edf3f8] text-[#28577e]">
                  <Icon className="size-5" />
                </div>

                <h3 className="mt-5 font-semibold text-[#173650]">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section
      id="process"
      className="scroll-mt-24 bg-white py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading
            eyebrow="How it works"
            title="A clear path to your next destination."
            description="Studying abroad can feel complicated. We help you understand the process and move forward one step at a time."
          />

          <Link
            to="/get-started"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-[#153b63] px-5 text-sm font-semibold text-white transition hover:bg-[#102e4d]"
          >
            Get Started
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`grid grid-cols-[48px_1fr] gap-4 p-5 sm:p-6 ${
                index !== steps.length - 1 ? "border-b border-slate-200" : ""
              }`}
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-[#edf3f8] text-sm font-bold text-[#28577e]">
                {step.number}
              </span>

              <div>
                <h3 className="font-semibold text-[#173650]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-y border-slate-200 bg-[#f3f7fa] py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39749b]">
            About NBridge
          </p>

          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#122c46] sm:text-4xl">
            Your ambitions deserve the right guidance.
          </h2>
        </div>

        <div>
          <p className="text-sm leading-8 text-slate-600 sm:text-base">
            Choosing where to study is an important decision. It involves your
            academic background, interests, resources and long-term goals.
            NBridge aims to help students explore their options and understand
            the next steps in their international education journey.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-[#173650]">Student-first</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your goals come first.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-[#173650]">Clear guidance</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Understand every step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-xl border border-slate-200 bg-[#f3f7fa] p-7 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39749b]">
              Start your journey
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#122c46] sm:text-4xl">
              Ready to explore your opportunities?
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Tell us about your academic background and study goals. Take
              the first step towards your international education journey.
            </p>
          </div>

          <Link
            to="/get-started"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#153b63] px-6 text-sm font-semibold text-white transition hover:bg-[#102e4d]"
          >
            Start Your Application
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#102b45] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white text-[#153b63]">
              <GraduationCap className="size-6" />
            </div>

            <div>
              <p className="text-xl font-bold">NBridge</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
                Global Education
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Helping students explore international education opportunities
            with clarity and confidence.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <a href="#destinations" className="hover:text-white">
              Destinations
            </a>
            <a href="#services" className="hover:text-white">
              Our Services
            </a>
            <a href="#process" className="hover:text-white">
              How it works
            </a>
            <a href="#about" className="hover:text-white">
              About us
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Get started</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/get-started" className="hover:text-white">
              Student Application
            </Link>
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} NBridge. All rights reserved.</p>
          <p>Global Education. Clear Direction.</p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#122c46]">
      <Navbar />
      <main>
        <HeroSection />
        <DestinationsSection />
        <ServicesSection />
        <ProcessSection />
        <AboutSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

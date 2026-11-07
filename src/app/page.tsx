"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Your scholarship co-pilot
            </span>
            <h1 className="mt-6 font-serif text-4xl md:text-6xl font-bold leading-tight text-foreground">
              Tell us about yourself once.
              <br />
              <span className="text-primary">We tell you exactly which scholarships you can win.</span>
            </h1>
            <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">
              Grantly turns a scattered, confusing scholarship hunt into one personalized feed — with plain-language eligibility, deadlines, checklists, and your next best action.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/onboarding">
                <Button size="lg" className="rounded-full px-8">
                  Find my scholarships <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/onboarding?sample=1">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Try with a sample student
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Animated preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-danger" />
              <div className="h-3 w-3 rounded-full bg-warning" />
              <div className="h-3 w-3 rounded-full bg-success" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Women in STEM Scholarship", score: 92, amount: "$3,000" },
                { title: "Future Engineers Grant", score: 85, amount: "₹50,000" },
                { title: "Need-Based Access Grant", score: 78, amount: "₹25,000" },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-border p-4">
                  <div className="font-medium text-sm">{c.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{c.score}% match</span>
                    <span className="text-sm text-muted-foreground">{c.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-3xl font-bold text-center">How it works</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "1", t: "Tell us about you", d: "A quick 90-second chat about your studies, goals, and needs." },
            { n: "2", t: "Get your matches", d: "A ranked feed with plain-language reasons you qualify." },
            { n: "3", t: "Apply & track", d: "One-click start, auto checklists, calendar, and reminders." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{s.n}</div>
              <h3 className="mt-4 font-serif text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pain point mapping */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-3xl font-bold text-center">Built for the real problems</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Discovery scattered? One personalized, ranked feed.",
            "Eligibility confusing? Plain-language Why you match / What's missing.",
            "Deadlines missed? Unified calendar, reminders, checklists.",
            "Applications repetitive? Reusable document & essay vault.",
            "No progress visibility? Dashboard with one clear next action.",
          ].map((t) => (
            <div key={t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Sample data for demonstration only. Grantly is not affiliated with any real scholarship provider.
      </footer>
    </div>
  );
}
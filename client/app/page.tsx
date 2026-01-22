"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Header,
  Hero,
  FeatureGrid,
  OfflineSpotlight,
  Architecture,
  ComparisonTable,
  TrustSection,
  PersonaGrid,
  Footer,
} from "@/components/landing";

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30 selection:text-primary-foreground">
      <Header />

      <main className="grow pt-16">
        <Hero />
        <FeatureGrid />
        <OfflineSpotlight />
        <Architecture />
        <ComparisonTable />
        <TrustSection />
        <PersonaGrid />

        {/* FINAL CTA SECTION */}
        <section className="py-40 relative px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-primary/10 rounded-full blur-[140px] -z-10" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
              Take back control of your <br className="hidden md:block" />{" "}
              company's data.
            </h2>

            <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto">
              Join 5,000+ data-driven teams analyzing sensitive files locally.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* PRIMARY BUTTON */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 0 40px -5px color-mix(in srgb, var(--primary), transparent 50%)",
                }}
                whileTap={{ scale: 0.95 }}
                className="rounded-4xl"
              >
                <Button
                  asChild
                  size="lg"
                  className="font-black py-6 px-12 rounded-4xl text-xl"
                >
                  <Link href="/chat">Try Online Now</Link>
                </Button>
              </motion.div>

              {/* SECONDARY BUTTON */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="py-6 px-12 rounded-4xl text-xl font-bold backdrop-blur-sm hover:bg-muted/10"
                >
                  Get Enterprise Self-Host
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;

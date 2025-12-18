"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, ExternalLink, ArchiveRestore, Briefcase } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function LandingPage() {

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-foreground">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.5);
          }
        }

        .fade-in-up,
        .fade-in-left,
        .fade-in-right,
        .fade-in {
          opacity: 0;
        }

        .fade-in-up.animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .fade-in-left.animate-in {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .fade-in-right.animate-in {
          animation: fadeInRight 0.8s ease-out forwards;
        }

        .fade-in.animate-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
        }

        .hover-scale {
          transition: transform 0.3s ease;
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .glow-button {
          transition: all 0.3s ease;
        }

        .glow-button:hover {
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
          transform: translateY(-2px);
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-border/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0f0d]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover-scale">
              <img src="/takfi-logo.svg" alt="" />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#home" className="text-[#00ff88] hover:text-[#00ff88]/80 transition-all duration-300 font-medium">
                Home
              </Link>
              <Link href="#about" className="text-white/70 hover:text-white transition-all duration-300">
                About Us
              </Link>
              <Link href="#how-it-works" className="text-white/70 hover:text-white transition-all duration-300">
                How it works
              </Link>
              <Link href="#faq" className="text-white/70 hover:text-white transition-all duration-300">
                FAQ
              </Link>
              <Button className="bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-semibold glow-button">
                Launch DApp
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0a0f0d] pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-16 relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-balance fade-in-up">
              <span className="text-white">Insure your Assets </span>
              <span className="text-[#00ff88]">Ethically</span>

              <br />
              <span className="text-[#00ff88]">on-chain</span>
         
            </h1>
            <p className="text-lg lg:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed fade-in-up stagger-1">
              Protect your assets with the world&apos;s first blockchain-powered ethical insurance platform. Built on chain,
              powered by AI, and rooted in fairness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up stagger-2">
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#00ff88] hover:bg-[#00ff88]/90 text-black font-semibold px-8 glow-button">
                  Launch DApp
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 bg-transparent hover-lift"
              >
                Request live demo
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="relative max-w-6xl mx-auto perspective-1000 fade-in-up stagger-3">
            <div className="relative transform-gpu transition-transform duration-500 hover:scale-[1.02]" style={{ transform: "rotateX(8deg) rotateY(0deg)" }}>
              {/* Dashboard content */}
              <div className="relative rounded-2xl overflow-auto">
                <img src="/policies.png" alt="TakFi Dashboard Preview" className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Insurance Needs Change Section */}
      <section className="py-20 px-6 bg-[#141A16]">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-12 justify-center items-center">
            {/* Left Side - Title */}
            <div className="basis-6/12 fade-in-left">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Why Insurance<br />Needs Change
              </h2>
            </div>

            {/* Right Side - Cards */}
            <div className="space-y-6">
              {/* Traditional Insurance Card */}
              <div className="bg-gradient-to-br from-[#2a4a3a] to-[#1e3a2a] rounded-3xl pr-8 border border-[#00ff88]/10 hover-lift fade-in-right stagger-1">
                <div className="flex pr-6 gap-8 items-center">
                  <img src="/bro.png" alt="" className="transition-transform duration-300 hover:scale-105" />
                  <div>
                    <p className="text-xl leading-relaxed">
                      Traditional insurance is expensive, profit-driven, and often excludes communities seeking Sharia-compliant solutions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 items-center gap-6">
                {/* Lack of Transparency Card */}
                <div className="bg-gradient-to-br from-[#2a4a3a] to-[#1e3a2a] rounded-3xl border border-[#00ff88]/10 hover-lift fade-in-right stagger-2">
                  <div className="flex flex-col px-6 py-24 gap-8 items-center">
                    <img src="/brolast.svg" alt="" className="transition-transform duration-300 hover:scale-105" />
                    <div>
                      <p className="text-xl leading-relaxed">
                        Lack of transparency, creating distrust in claims and payouts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Millions Uninsured Card */}
                <div className="bg-gradient-to-br from-[#2a4a3a] to-[#1e3a2a] rounded-3xl border border-[#00ff88]/10 hover-lift fade-in-right stagger-3">
                  <div className="flex flex-col px-6 py-20 gap-8 items-center">
                    <img src="/rafiki.svg" alt="" className="transition-transform duration-300 hover:scale-105" />
                    <div>
                      <p className="text-xl leading-relaxed">
                        Millions remain uninsured because current models are inaccessible and unfair.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Need to Revolutionize Insurance Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 fade-in-up">
            <span className="text-white">The Need to </span>
            <span className="text-[#00ff88]">Revolutionize</span>
            <span className="text-white"> Insurance</span>
          </h2>

          {/* Main Content Frame */}
          <div className="relative max-w-6xl mx-auto">
            {/* Content Container */}
            <div className="grid lg:grid-cols-[3fr_2fr] gap-12 items-center">
              {/* Left side - Policy Cards Mockup */}
              <div className="space-y-6 fade-in-left">
                <img src="/carinsurance.svg" alt="" className="hover-scale" />
              </div>

              {/* Right side - Text Content */}
              <div className="space-y-6 fade-in-right">
                <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Individual and Group Policies
                </h3>
                <p className="text-lg text-white/70 leading-relaxed">
                  Protect yourself with an individual plan or join your family, friends, or community in a group
                  policy – fair, transparent, and Sharia-compliant coverage powered by blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Claims Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "#141A16 radial-gradient(circle at center, #0d1512 60%, #0a0f0d 100%)",
          backgroundImage: "url('/claimbg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "right center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Fast Claims content */}
            <div className="space-y-8 fade-in-left">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-balance">
                  Fast Claims <Zap className="inline w-12 h-12 text-[#12D96A] float-animation" />
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Protect yourself with an individual plan or join your family, friends, or community in a group policy
                  – fair, transparent, and Sharia-compliant coverage powered by blockchain.
                </p>
              </div>
              <Button size="lg" className="bg-[#12D96A] hover:bg-primary/90 text-primary-foreground glow-button">
                Try live demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Right side - Submit Claim Form */}
            <div className="relative fade-in-right">
              <img src="/submit_claim.svg" alt="" className="hover-scale" />
            </div>
          </div>
        </div>
      </section>

      {/* Secure and Transparent Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify between gap-6">
          <div className="basis-6/12 fade-in-left">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Secure and
              <br />
              Transparent
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built on blockchain technology for complete transparency and security. Every transaction is recorded,
              every claim is traceable, and every decision is auditable.
            </p>
          </div>
          <div className="fade-in-right">
            <img src="/secure.svg" alt="" className="hover-scale" />
          </div>
        </div>
      </section>

      {/* Sharia-Compliant & Ethical Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify between gap-6">
          <div className="fade-in-left">
            <img src="/shariah-compl.svg" alt="" className="hover-scale" />
          </div>
          <div className="basis-6/12 fade-in-right">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Sharia-Compliant
              <br />& Ethical
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our insurance model follows Islamic finance principles, ensuring ethical practices without interest,
              gambling, or excessive uncertainty. Fair coverage for everyone, regardless of background.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works"
        className="relative overflow-hidden py-20"
        style={{
          background: "#141A16 radial-gradient(circle at center, #0d1512 60%, #0a0f0d 100%)",
          backgroundPosition: "right center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 fade-in-up">
              <span className="text-white">How it </span>
              <span className="text-[#00ff88]">Works</span>
            </h2>
          </div>
          {/* step 1 */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-top justify between gap-6 pb-[60vh]">
            <div className="basis-6/12 fade-in-left">
              <p className="text-[36px] font-semibold text-gray-500 mb-2">
                Step 1
              </p>
              <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
                Create a policy (individual or group)
              </p>
            </div>
            <div className="relative fade-in-right">
              <img src="/howitworks1.svg" alt="" className="hover-scale" />
              <img
                src="/howitworks2.png"
                alt=""
                className="absolute hover-scale"
                style={{
                  bottom: '-12vh',
                  right: '-12vw',
                  zIndex: 10,
                }}
              />
            </div>
            <img src="/line1.svg" alt="line1" className="absolute top-30 left-40 fade-in" />
          </div>
          {/* Step 2 */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-top justify between gap-20 pb-[30vh]">
            <div className="relative fade-in-left">
              <img src="/contrib-prev.svg" alt="" className="hover-scale" />
            </div>
            <div className="basis-5/12 fade-in-right">
              <p className="text-[36px] font-semibold text-gray-500 mb-2">
                Step 2
              </p>
              <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
                Contribute your share to a pooled fund (secure on chain)
              </p>
            </div>
            <img src="/line2and4.svg" alt="line1" className="absolute top-30 left-43 fade-in" />
          </div>
          {/* step 3 */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-top justify between gap-16 pb-[50vh]">
            <div className="basis-6/12 fade-in-left">
              <p className="text-[36px] font-semibold text-gray-500 mb-2">
                Step 3
              </p>
              <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
                Submit claims when needed → AI + group governance validate requests
              </p>
            </div>
            <div className="relative fade-in-right">
              <img src="/submit_claim.svg" alt="" className="hover-scale" />
              <img
                src="/claim_success.svg"
                alt=""
                className="absolute hover-scale"
                style={{
                  bottom: '-12vh',
                  right: '-12vw',
                  zIndex: 10,
                }}
              />
            </div>
            <img src="/line1.svg" alt="line1" className="absolute top-40 left-40 fade-in" />
          </div>
          {/* Step 4 */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-top justify between gap-20 pb-[65vh]">
            <div className="relative fade-in-left">
              <img src="/claim-history.svg" alt="" className="hover-scale" />
            </div>
            <div className="basis-5/12 fade-in-right">
              <p className="text-[36px] font-semibold text-gray-500 mb-2">
                Step 4
              </p>
              <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
                Contribute your share to a pooled fund (secure on chain)
              </p>
            </div>
            <img src="/line2and4.svg" alt="line1" className="absolute top-40 left-43 fade-in" />
          </div>
          {/* step 5 */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-top justify between gap-6 pb-[10vh]">
            <div className="basis-6/12 fade-in-left">
              <p className="text-[36px] font-semibold text-gray-500 mb-2">
                Step 5
              </p>
              <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
                Surplus is fairly redistributed at the end of the term
              </p>
            </div>
            <div className="relative fade-in-right">
              <div className="bg-[#1E2722] pl-8 pr-18 pt-6 pb-14 rounded-[25px] mb-4 hover-lift">
                <div className="flex items-center justify-start gap-2 mb-4">
                  <Briefcase className="inline w-7 h-7 text-white" />
                  <p className="text-lg font-normal text-white max-w-3xl leading-relaxed">
                    Pool size
                  </p>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-center">
                  $111.81K
                </h2>
              </div>
              <div className="bg-[#1E2722] pl-8 pr-18 pt-6 pb-14 rounded-[25px] mb-4 hover-lift">
                <div className="flex items-center justify-start gap-2 mb-4">
                  <ArchiveRestore className="inline w-7 h-7 text-white" />
                  <p className="text-lg font-normal text-white max-w-3xl leading-relaxed">
                    Total Claimed
                  </p>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-center">
                  $51.81K
                </h2>
              </div>
              <div className="bg-[#1E2722] pl-8 pr-18 pt-6 pb-14 rounded-[25px] hover-lift">
                <div className="flex items-center justify-start gap-2 mb-4">
                  <img src="/surplus-icon.svg" alt="" />
                  <p className="text-lg font-normal text-white max-w-3xl leading-relaxed">
                    Current Surplus
                  </p>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-center">
                  $60K
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="takfi-logo.svg" alt="" />
              </div>
              <p className="text-muted-foreground">
                Ethical insurance for the modern world. Transparent, community-driven, and Sharia-compliant.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Individual Policies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Group Policies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Claims
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 TakFi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
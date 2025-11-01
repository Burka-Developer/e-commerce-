"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react"
import { useLanguage } from "./language-provider"

export function HeroSection() {
  const { lang } = useLanguage()
  const lines = lang === "ar" ? ["الأناقة تليق", "مع", "شخصيتك"] : ["STYLE GOES", "WITH YOUR", "PERSONALITY"]
  return (
    <section className="relative w-full h-screen bg-[#FCF6EA] overflow-hidden flex items-center">
      {/* background blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[45vw] h-[45vw] max-w-[640px] max-h-[640px] bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[45vw] h-[45vw] max-w-[640px] max-h-[640px] bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-center min-h-[90vh]">
          {/* left image */}
          <div className="col-span-12 lg:col-span-3 flex justify-center lg:justify-start">
            <div className="relative w-56 sm:w-64 md:w-72 h-[30rem] overflow-hidden rounded-[140px] shadow-md">
              <div className="absolute -inset-6 rounded-[inherit] bg-gradient-to-b from-primary/15 to-transparent blur-2xl" />
              <Image
                src="/abaya1.webp"
                alt="Editorial fashion shot"
                width={400}
                height={700}
                className="w-full h-full object-cover"
                priority
              />

              {/* mobile overlay */}
              <div className="absolute inset-0 lg:hidden flex flex-col items-center justify-center text-center px-4">
                <h1 className="font-display font-semibold leading-tight text-white drop-shadow-md max-w-[16ch] text-4xl sm:text-5xl">
                  <span className="block">{lines[0]}</span>
                  <span className="block">{lines[1]}</span>
                  <span className="block">{lines[2]}</span>
                </h1>
                <p className="mt-2 text-white/90 text-sm">Shop with Store108</p>
                <Link
                  href="/products"
                  className="relative group mt-6 block w-36 aspect-square rounded-full"
                >
                  <span className="absolute inset-0 rounded-full border-2 border-primary/90 bg-white/10 backdrop-blur-[2px] transition-transform duration-300 group-hover:scale-110" />
                  <span className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                    <span className="text-[11px] font-semibold">Check New</span>
                    <span className="text-[11px] font-semibold">Collection</span>
                    <ArrowRight className="mt-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </Link>

                {/* mobile rotating circle - top right */}
                <div className="absolute top-4 right-4 w-20 h-20 text-white/80">
                  <motion.svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  >
                    <defs>
                      <path id="hero-mobile-circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text fontSize="9" fill="currentColor">
                      <textPath xlinkHref="#hero-mobile-circle">Be free • Be style • 108 •</textPath>
                    </text>
                  </motion.svg>
                </div>
              </div>
            </div>
          </div>

          {/* center text */}
          <div className="pt-12 hidden lg:block col-span-12 lg:col-span-6 text-center">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight text-foreground">
              <span className="block">{lines[0]}</span>
              <span className="block">{lines[1]}</span>
              <span className="block">{lines[2]}</span>
            </h1>

            <p className="mt-4 text-sm md:text-base lg:text-lg text-muted-foreground">Shop with Store108</p>

            <div className="mt-8 flex items-center justify-center">
              <Link href="/products" className="relative group block w-40 h-40 md:w-48 md:h-48 rounded-full">
                <span className="absolute inset-0 rounded-full border-2 border-primary transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                  <span className="text-xs md:text-sm font-semibold">Check New</span>
                  <span className="text-xs md:text-sm font-semibold">Collection</span>
                  <ArrowRight className="mt-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
              </Link>
            </div>

            <div className="mt-10 hidden lg:flex justify-center">
              <Link href="#about" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className="h-5 w-5" />
                <span>Scroll</span>
              </Link>
            </div>
          </div>

          {/* right image + circular text */}
          <div className="hidden lg:flex col-span-12 lg:col-span-3 flex-col items-end gap-8">
            <div className="relative w-36 h-36">
              <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full text-muted-foreground"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <path
                    id="hero-circle-path"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  />
                </defs>
                <text fontSize="9" className="fill-current">
                  <textPath xlinkHref="#hero-circle-path">
                    Be free. Be style. Be yourself. With Your New Collection.
                  </textPath>
                </text>
              </motion.svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="relative w-72 sm:w-80 h-[30rem] overflow-hidden rounded-3xl shadow-md">
              <div className="absolute -inset-6 rounded-[inherit] bg-gradient-to-t from-accent/15 to-transparent blur-2xl" />
              <Image
                src="/abaya2.webp"
                alt="Lifestyle outdoor photo"
                width={640}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

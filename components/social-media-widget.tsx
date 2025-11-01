"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FaYoutube, FaFacebook, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

const socialLinks = [
  {
    name: "YouTube",
    icon: FaYoutube,
    url: "https://www.youtube.com/@Establishment-108",
    color: "bg-[#FF0000]",
    hoverColor: "hover:bg-[#CC0000]",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    url: "https://www.facebook.com/share/1HB9h7YE2w/",
    color: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#1465D8]",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "https://www.instagram.com/108.cl?igsh=aXM1b2NiNGE0bmhi",
    color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    hoverColor: "hover:opacity-90",
  },
  {
    name: "Snapchat",
    icon: FaSnapchat,
    url: "https://www.snapchat.com/add/est.108?share_id=MfPCf_2KRcQ&locale=ar-SA",
    color: "bg-[#FFFC00]",
    hoverColor: "hover:bg-[#E6E300]",
    textColor: "text-black",
  },
  {
    name: "X",
    icon: FaXTwitter,
    url: "https://x.com/S7Yol?s=09",
    color: "bg-black",
    hoverColor: "hover:bg-gray-800",
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    url: "https://tiktok.com/@108.cl",
    color: "bg-black",
    hoverColor: "hover:bg-gray-800",
  },
]

export function SocialMediaWidget() {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block"
    >
      <div className="flex flex-col gap-3 bg-background/95 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-border">
        <div className="text-center mb-1">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Follow</p>
        </div>
        
        {socialLinks.map((social, index) => {
          const Icon = social.icon
          return (
            <motion.div
              key={social.name}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
            >
              <Link
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  group relative flex items-center justify-center w-12 h-12 rounded-xl
                  ${social.color} ${social.hoverColor}
                  transition-all duration-300 transform hover:scale-110
                  shadow-lg hover:shadow-xl focus-ring
                `}
                aria-label={social.name}
              >
                <Icon className={`h-6 w-6 ${social.textColor || "text-white"}`} />
                
                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
                  {social.name}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

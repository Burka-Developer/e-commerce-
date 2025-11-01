"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { ShoppingBag, Users, Heart, Zap } from "lucide-react"

export function AboutSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: ShoppingBag,
      title: t("premiumQuality"),
      description: t("premiumQualityDesc"),
    },
    {
      icon: Users,
      title: t("customerFirst"),
      description: t("customerFirstDesc"),
    },
    {
      icon: Heart,
      title: t("styleElegance"),
      description: t("styleEleganceDesc"),
    },
    {
      icon: Zap,
      title: t("fastDelivery"),
      description: t("fastDeliveryDesc"),
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <section id="about" className="relative py-12 md:py-20 bg-gradient-to-b from-background to-primary/5">
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-block font-accent text-sm font-semibold text-accent mb-4 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t("about108")}
          </motion.span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-balance mb-6 tracking-tight">
            {t("luxuryFashionRedefined")}
          </h2>
          <motion.p 
            className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t("aboutIntro")}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-12 md:mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className="group relative p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="mb-4 inline-block p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="h-6 w-6 text-accent" />
                  </motion.div>
                  
                  <h3 className="font-accent text-xl font-bold mb-3 text-foreground tracking-wide">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}

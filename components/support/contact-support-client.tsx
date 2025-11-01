"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MessageCircle, Clock, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ContactSupportClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the form data to your backend
    console.log("Support form submitted:", formData)
    setSubmitted(true)
    setFormData({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setSubmitted(false), 3000)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your queries anytime",
      contact: "support@108.com",
      link: "mailto:support@108.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team directly",
      contact: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick chat support available",
      contact: "+1 (555) 123-4567",
      link: "https://wa.me/15551234567"
    },
    {
      icon: Clock,
      title: "Hours",
      description: "We're always here to help",
      contact: "24/7 Available",
      link: "#"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              How can we <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our dedicated support team is here to assist you 24/7. Reach out using any method that works best for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.a
                  key={index}
                  href={method.link}
                  className="group relative p-6 rounded-xl bg-card border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="mb-4 inline-block p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="h-6 w-6 text-accent" />
                    </motion.div>
                    
                    <h3 className="font-display text-lg font-bold mb-2 text-foreground">
                      {method.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    
                    <p className="font-semibold text-accent">
                      {method.contact}
                    </p>
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold mb-8">
                Send us a <span className="text-accent">Message</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-accent/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-accent/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-accent/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Please describe your issue or question in detail..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-accent/50 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </motion.button>

                {submitted && (
                  <motion.div
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-700 text-center font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ✓ Message sent successfully! We'll be in touch soon.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold mb-8">
                Common <span className="text-accent">Questions</span>
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "What is your return policy?",
                    a: "We offer a 30-day return policy on all items. Simply contact our support team with your order details."
                  },
                  {
                    q: "How long does delivery take?",
                    a: "Standard delivery takes 3-5 business days. Express delivery options are available during checkout."
                  },
                  {
                    q: "Do you offer international shipping?",
                    a: "Yes, we ship to selected countries. Check our shipping page for details on rates and delivery times."
                  },
                  {
                    q: "How can I track my order?",
                    a: "You'll receive a tracking number via email once your order ships. You can track it on our website anytime."
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit/debit cards, digital wallets, and multiple payment gateways for your convenience."
                  },
                  {
                    q: "Can I cancel my order?",
                    a: "Orders can be cancelled within 24 hours of purchase. After that, please contact our support team."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-lg bg-card border border-border/50 hover:border-accent/30 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.q}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.a}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

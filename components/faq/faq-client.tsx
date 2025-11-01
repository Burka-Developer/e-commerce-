"use client"

import { motion } from "framer-motion"
import { ChevronDown, Search } from "lucide-react"
import { useState } from "react"

export function FAQClient() {
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const faqs = [
    {
      category: "Shipping & Delivery",
      items: [
        {
          q: "How long does delivery take?",
          a: "Standard delivery takes 3-5 business days from the order date. Express delivery (1-2 days) is available in major cities. You'll receive a tracking number via email once your order ships."
        },
        {
          q: "Do you offer free shipping?",
          a: "Yes! We offer free shipping on orders above $50. For orders below $50, shipping charges apply based on your location."
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we ship within the United States and selected international destinations. Check our shipping page for your location availability."
        },
        {
          q: "Can I change my delivery address?",
          a: "Yes, you can modify your address within 2 hours of placing your order. After that, please contact our support team immediately."
        },
        {
          q: "What should I do if my package is lost?",
          a: "Report the issue to us within 5 days of delivery date with your tracking number. We'll investigate and either redeliver or refund your order."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      items: [
        {
          q: "What is your return policy?",
          a: "We offer a 30-day return policy on all items. Products must be unused and in original packaging. Simply contact our support team to initiate a return."
        },
        {
          q: "How long does a refund take?",
          a: "Once we receive and inspect your returned item, refunds are processed within 5-7 business days to your original payment method."
        },
        {
          q: "What about worn or damaged items?",
          a: "Items that show signs of wear cannot be returned. However, we stand behind our quality. If there's a manufacturing defect, we'll replace it free of charge."
        },
        {
          q: "Can I return items without a reason?",
          a: "Yes, you can return items within 30 days for a full refund. Shipping costs for returns are covered by the customer unless the item is defective."
        },
        {
          q: "Do I need the original receipt?",
          a: "We can look up your order using your email address or order number. The original receipt helps speed up the process."
        }
      ]
    },
    {
      category: "Products & Sizing",
      items: [
        {
          q: "How do I choose the right size?",
          a: "Check our detailed size guide on each product page. We provide measurements in both inches and centimeters. If you're unsure, our team can help you via email or WhatsApp."
        },
        {
          q: "What materials do you use?",
          a: "All our products are made from premium, high-quality materials. We use 100% pure fabrics and premium blends. Check individual product descriptions for material details."
        },
        {
          q: "Do you have products for different body types?",
          a: "Yes, our collection includes options for all body types and sizes. We're committed to inclusive sizing and comfort for everyone."
        },
        {
          q: "Are the Abayas customizable?",
          a: "Some items can be customized. Contact our support team with your requirements, and we'll provide options and pricing for custom orders."
        },
        {
          q: "How should I care for my items?",
          a: "Each product comes with care instructions. Generally, we recommend hand washing in cold water and air drying for best results and longevity."
        }
      ]
    },
    {
      category: "Payment & Orders",
      items: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards (Visa, Mastercard, American Express), digital wallets (Apple Pay, Google Pay), and multiple secure payment gateways."
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use industry-standard SSL encryption and secure payment gateways. Your payment information is never stored on our servers."
        },
        {
          q: "Can I use a promo code?",
          a: "Yes! You can apply promo codes at checkout. Check our email newsletter and social media for current promotions and discount codes."
        },
        {
          q: "Can I change or cancel my order?",
          a: "Orders can be modified or cancelled within 1 hour of purchase. After that, if not shipped, contact our support team as soon as possible."
        },
        {
          q: "Do you offer gift cards?",
          a: "Yes, we offer digital gift cards in any amount. They can be used on any product and never expire. Perfect for any occasion!"
        }
      ]
    },
    {
      category: "Account & User",
      items: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' on our website and enter your email. You can also sign up using Google or other social accounts for faster registration."
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a password reset link within minutes."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can request account deletion. Contact our support team, and we'll process your request within 7 days. This cannot be undone."
        },
        {
          q: "How do I track my order?",
          a: "Log into your account and go to 'My Orders'. Click on any order to see detailed status and tracking information."
        },
        {
          q: "How do I save items to my wishlist?",
          a: "Click the heart icon on any product to add it to your wishlist. You can view and manage your wishlist from your account profile."
        }
      ]
    },
    {
      category: "Quality & Brand",
      items: [
        {
          q: "Are products authentic?",
          a: "100% authentic and original. All items are sourced directly from designers and manufacturers. We provide certificates of authenticity when applicable."
        },
        {
          q: "Do you have quality guarantees?",
          a: "Yes, all products come with a quality guarantee. If there's a manufacturing defect, we'll replace or refund the item."
        },
        {
          q: "How often is new inventory added?",
          a: "We update our collection weekly with new designs and styles. Follow us on social media to be first to know about new arrivals!"
        },
        {
          q: "Can I request a specific product?",
          a: "Absolutely! We love customer suggestions. Email us or use our contact form to request specific products or collections."
        },
        {
          q: "Do you collaborate with designers?",
          a: "Yes, we work with talented designers to bring exclusive collections. Check our collaborations section for limited-edition items."
        }
      ]
    }
  ]

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
              Frequently Asked <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Find answers to common questions about our products, orders, and services.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-background border border-border/50 focus:border-accent/50 focus:outline-none transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          {filteredFaqs.length > 0 ? (
            <motion.div
              className="space-y-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {filteredFaqs.map((category, categoryIndex) => (
                <motion.div key={categoryIndex} variants={itemVariants}>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-full" />
                    {category.category}
                  </h2>

                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        className="border border-border/50 rounded-lg overflow-hidden hover:border-accent/30 transition-colors"
                        whileHover={{ y: -2 }}
                      >
                        <button
                          onClick={() => setExpandedIndex(expandedIndex === `${categoryIndex}-${itemIndex}` ? null : `${categoryIndex}-${itemIndex}`)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-card hover:bg-card/80 transition-colors"
                        >
                          <h3 className="font-semibold text-left text-foreground text-base">
                            {item.q}
                          </h3>
                          <ChevronDown
                            className={`h-5 w-5 text-accent transition-transform duration-300 flex-shrink-0 ${
                              expandedIndex === `${categoryIndex}-${itemIndex}` ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedIndex === `${categoryIndex}-${itemIndex}` ? "auto" : 0,
                            opacity: expandedIndex === `${categoryIndex}-${itemIndex}` ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden bg-primary/5"
                        >
                          <div className="px-6 py-4 border-t border-border/50">
                            <p className="text-muted-foreground leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-lg text-muted-foreground mb-4">
                No questions found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-accent hover:text-accent/80 font-semibold transition-colors"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Still need <span className="text-accent">help?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find the answer you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support"
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Contact Support
              </a>
              <a
                href="https://wa.me/15551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border-2 border-accent/30 text-foreground rounded-lg font-semibold hover:bg-accent/10 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

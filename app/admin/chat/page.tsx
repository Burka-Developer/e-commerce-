import React from "react"
import AIChatWidget from "@/components/ai-chat-widget"

export const metadata = {
  title: "Admin • Help Chat",
}

export default function AdminChatPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Help Assistant (Admin)</h1>
      <p className="text-sm text-gray-600 mb-6">
        This assistant answers from your FAQ content only and does not call external AI. Avoid sharing sensitive data.
      </p>
      {/* Render the widget inline for a larger workspace */}
      <div className="border rounded-lg">
        <div className="p-2">
          <AIChatWidget className="static" />
        </div>
      </div>
    </div>
  )
}

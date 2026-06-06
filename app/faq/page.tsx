"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "What is the Research community Directory? What is open science labs?",
    answer: (
      <>
        The Research community Directory is a curated collection of online servers focused on various gradschool communities not in university; see{" "}
        <a 
          href="https://www.lesswrong.com/posts/9eehTtLsTBZR9Bd7Q/on-open-science-research-labs-on-discord-and-getting-more" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline break-all"
        >
          https://www.lesswrong.com/posts/9eehTtLsTBZR9Bd7Q/on-open-science-research-labs-on-discord-and-getting-more
        </a>.
      </>
    )
  },
  {
    question: "How are servers scored?",
    answer: "Servers are scored on a scale of 0-10 based on multiple factors including activity level, quality of discussions, and mostly vibes. All scored by me, seon."
  },
  {
    question: "What is the T-SNE view?",
    answer: "T-SNE (t-distributed Stochastic Neighbor Embedding) is a visualization technique that places similar servers closer together on a 2D map. This helps you discover servers that are similar to ones you already like. It looks cool."
  },
  {
    question: "How does the Quadrant view work?",
    answer: "The Quadrant view lets you select two tags and see how servers are distributed based on whether they have those tags or not. It also looks cool."
  },
  {
    question: "How can I submit a server? What about changing a score?",
    answer: (
      <>
        To submit a new server for consideration, message me at discord <strong>seonresearch</strong>,{" "}
        <a 
          href="https://x.com/SeonGunness" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline"
        >
          x.com/seongunness
        </a>
        , add it to the{" "}
        <a 
          href="https://docs.google.com/spreadsheets/d/1DlBT1pF8-zMECntRWXFsL46gZyvNp1BJlJ6LXGze4dA/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline break-all"
        >
          original sheet
        </a>
        , or join my server and ask there:{" "}
        <a 
          href="https://discord.gg/g5ZvRRZfv5" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline"
        >
          https://discord.gg/g5ZvRRZfv5
        </a>
      </>
    )
  },
  {
    question: "How often is the data updated?",
    answer: "Rarely. Tags are decently outdated but scores mostly feel correct."
  },
  {
    question: "Is this project open source?",
    answer: (
      <>
        Scores by me, code here:{" "}
        <a 
          href="https://github.com/nseon1/discord-directory" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline break-all"
        >
          https://github.com/nseon1/discord-directory
        </a>
        . You can submit servers to the spreadsheet. And I am looking for assistance to add community scores!
      </>
    )
  }
]

function FAQItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-card rounded-xl border border-border bevel-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
      >
        <span className="font-semibold text-foreground">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center bevel-border glow-gold">
              <HelpCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Commonly asked questions
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

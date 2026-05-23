"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function AboutPage() {
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
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">About Research community Directory</h1>
          </div>

          {/* Content */}
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border bevel-border">
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                note: see FAQ for github. Research community Directory  was a spreadsheet that started in November of 2024, it started with 100 servers but grew to well over 600, requiring some cutting down.
              </p>
              
              <p>
                The original sheet can be found here, there are the extra servers here:<br />
                <a 
                  href="https://docs.google.com/spreadsheets/d/1DlBT1pF8-zMECntRWXFsL46gZyvNp1BJlJ6LXGze4dA/edit?gid=0#gid=0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://docs.google.com/spreadsheets/d/1DlBT1pF8-zMECntRWXFsL46gZyvNp1BJlJ6LXGze4dA/edit?gid=0#gid=0
                </a>
              </p>

              <p>
                There seems to be a rise of academic work and groups that have no allegiances to academia, more info here:<br />
                <a 
                  href="https://www.lesswrong.com/posts/9eehTtLsTBZR9Bd7Q/on-open-science-research-labs-on-discord-and-getting-more" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://www.lesswrong.com/posts/9eehTtLsTBZR9Bd7Q/on-open-science-research-labs-on-discord-and-getting-more
                </a>
                <br />
                youtube version here{' '}
                <a 
                  href="https://www.youtube.com/watch?v=njgXqYTvIzI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://www.youtube.com/watch?v=njgXqYTvIzI
                </a>
              </p>

              <p>
                I am currently writing a book on the topic.
              </p>

              <div className="pt-6 border-t border-border mt-8">
                <p className="text-foreground">
                  You can find me on discord at <strong className="text-primary">seonresearch</strong><br />
                  or <a 
                    href="https://x.com/SeonGunness" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://x.com/SeonGunness
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

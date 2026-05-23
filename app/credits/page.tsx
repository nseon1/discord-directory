"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Code, Database, Palette, Star } from "lucide-react"

export default function CreditsPage() {
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
              <Heart className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Credits</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Thank you to everyone who made this project possible
            </p>
          </div>

          {/* Main Contributors */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Core Team
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-foreground">Seon Gunness</div>
                  <div className="text-sm text-muted-foreground">Project Lead & Data Curator</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Additional contributors:</strong> Special thanks to the 2025 SOAR team: qk, inkosana, jellyfish, vedant bachhav, and joseph awuah. You all saved me a lot of time helping create some sample iterations of the site, testing and giving various data visualization and analytics ideas, and going through a lot of existing online aggregates of servers in non-discord spaces and finding a few good ones that were added, too!
              </p>
            </div>
          </div>
          
          {/* Sponsors */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Sponsors
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>BATbot!</strong> for letting me use its Gemini, Claude, and other models to help write the current code.
            </p>
          </div>

          {/* Data Sources */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Sources
            </h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Server information curated through manual research and community submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>T-SNE embeddings generated using server descriptions and characteristics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Activity levels and scores based on periodic reviews</span>
              </li>
            </ul>
          </div>

          {/* Technologies */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Built With
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "Vercel",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Special Thanks */}
          <div className="bg-card rounded-2xl p-6 border border-border bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Special Thanks</h2>
            <p className="text-muted-foreground leading-relaxed">
              To all the Discord server owners and moderators who work tirelessly to build 
              and maintain welcoming communities for AI enthusiasts. Your efforts make the 
              AI space more accessible and collaborative for everyone.
            </p>
          </div>

          {/* Contribute */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20 bevel-border">
            <h2 className="text-xl font-bold text-foreground mb-2">Want to Contribute?</h2>
            <p className="text-muted-foreground mb-4">
              We welcome contributions! Whether it is submitting new servers, updating 
              existing information, or improving the code, every bit helps.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <Link href="https://github.com/nseon1/jsonforservers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                GitHub Repository
              </Link>
              <Link href="https://docs.google.com/spreadsheets/d/1DlBT1pF8-zMECntRWXFsL46gZyvNp1BJlJ6LXGze4dA/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                Google Sheets Data
              </Link>
            </div>
            <Link href="/donations">
              <Button className="bevel-border">
                <Heart className="h-4 w-4 mr-2" />
                Support the Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

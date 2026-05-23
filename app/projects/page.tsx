"use client"

import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Moon, 
  Sun, 
  Menu, 
  ChevronDown,
  ExternalLink,
  Info,
  HelpCircle,
  Heart,
  Users,
  Sparkles,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

const PROJECTS_URL = "/projects_data.json"

interface Project {
  "project name": string
  "project description": string
  contact: string
}

function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center bevel-border">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Community Projects</h1>
              <p className="text-xs text-muted-foreground">Open research initiatives</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="bevel-border hidden sm:flex">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Link>
            </Button>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bevel-border">
                  <Menu className="h-4 w-4" />
                  Menu
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/" className="cursor-pointer">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Directory
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="cursor-pointer">
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/credits" className="cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    Credits
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/faq" className="cursor-pointer">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    FAQ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/donations" className="cursor-pointer">
                    <Heart className="h-4 w-4 mr-2" />
                    Donations / Crypto
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function ProjectsPage() {
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch(PROJECTS_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load projects_data.json")
        return r.json()
      })
      .then((json: Project[]) => {
        // Just set the data directly!
        setData(json)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!query) return data
    const q = query.toLowerCase()
    return data.filter(p => 
      p["project name"].toLowerCase().includes(q) || 
      p["project description"].toLowerCase().includes(q)
    )
  }, [data, query])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-destructive font-medium">Failed to load: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-3 flex-wrap items-center mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border bevel-border text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-foreground">{filtered.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all bevel-border hover:glow-gold group flex flex-col"
            >
              <div className="font-bold text-foreground leading-tight capitalize mb-2 text-lg">
                {p["project name"]}
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                {p["project description"]}
              </p>
              
              <div className="mt-auto pt-4 border-t border-border/50">
                <a
                  href={p.contact}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View Project
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border bevel-border">
            No projects found matching your search.
          </div>
        )}
      </main>
      
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Research community Directory - Find your community</p>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Moon, 
  Sun, 
  Menu, 
  ChevronDown,
  Info,
  HelpCircle,
  Heart,
  Users,
  Sparkles,
  BookOpen,
  Calendar as CalendarIcon,
  ExternalLink,
  Clock
} from "lucide-react"
import Link from "next/link"

const READING_GROUPS_URL = "/readinggroups_data.json"

interface RawEvent {
  name: string
  ISOstart: string
  ISOend: string
  link: string
  type: "weekly" | "biweekly"
}

interface CalendarEvent extends RawEvent {
  start: Date
  end: Date
}

// Reuse the Header to keep your site consistent
function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center bevel-border">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-lg font-bold text-foreground">Research community Directory</h1>
              <p className="text-xs text-muted-foreground">Discover non-university research communities</p>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="bevel-border hidden sm:flex">
              <Link href="/projects">Projects</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="bevel-border hidden sm:flex">
              <Link href="/readinggroups">Reading Groups</Link>
            </Button>

            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
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
                  <Link href="/projects"><Sparkles className="h-4 w-4 mr-2" /> Projects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/readinggroups"><BookOpen className="h-4 w-4 mr-2" /> Reading Groups</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem asChild><Link href="/about"><Info className="h-4 w-4 mr-2" /> About</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/credits"><Users className="h-4 w-4 mr-2" /> Credits</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/faq"><HelpCircle className="h-4 w-4 mr-2" /> FAQ</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/donations"><Heart className="h-4 w-4 mr-2" /> Donations / Crypto</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function ReadingGroupsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Calculate the next 7 days starting from today
  const [days] = useState(() => {
    const d = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(today)
      nextDay.setDate(today.getDate() + i)
      d.push(nextDay)
    }
    return d
  })

  useEffect(() => {
    fetch(READING_GROUPS_URL)
      .then(res => res.json())
      .then((rawEvents: RawEvent[]) => {
        const now = new Date()
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000
        const projectedEvents: CalendarEvent[] = []

        rawEvents.forEach(evt => {
          const origStart = new Date(evt.ISOstart)
          const origEnd = new Date(evt.ISOend)
          const duration = origEnd.getTime() - origStart.getTime()

          // Fast forward the 2024 date to the current week
          const weeksDiff = Math.floor((now.getTime() - origStart.getTime()) / oneWeekMs)
          
          // Generate occurrences for this week and next week to ensure we fill the 7-day view
          for (let offset = 0; offset <= 1; offset++) {
            const instanceStart = new Date(origStart.getTime() + (weeksDiff + offset) * oneWeekMs)
            const instanceWeeksDiff = Math.round((instanceStart.getTime() - origStart.getTime()) / oneWeekMs)
            
            // If biweekly, skip odd weeks relative to original start
            if (evt.type === "biweekly" && instanceWeeksDiff % 2 !== 0) continue

            projectedEvents.push({
              ...evt,
              start: instanceStart,
              end: new Date(instanceStart.getTime() + duration)
            })
          }
        })

        setEvents(projectedEvents)
        setLoading(false)

        // Ergonomics: Auto-scroll to current hour minus 1 so it's centered nicely
        setTimeout(() => {
          if (scrollRef.current) {
            const currentHour = new Date().getHours()
            const scrollAmount = Math.max(0, (currentHour - 1) * 60) // 60px per hour
            scrollRef.current.scrollTop = scrollAmount
          }
        }, 100)
      })
      .catch(console.error)
  }, [])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="text-primary" />
              Reading Groups
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Upcoming weekly and biweekly events, automatically converted to your local time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
            <Clock className="w-3.5 h-3.5" />
            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center animate-pulse">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-card border border-border rounded-xl bevel-border overflow-hidden flex flex-col min-h-[500px]">
            
            {/* The unified scroll area for both X and Y */}
            <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-gold relative">
              
              {/* Calendar Header (Days) - Frozen to Top */}
              <div className="flex border-b border-border bg-muted/95 backdrop-blur sticky top-0 z-40 w-fit min-w-full">
                <div className="w-16 flex-shrink-0 border-r border-border bg-muted/95 sticky left-0 z-50" /> {/* Time column spacer */}
                {days.map((day, i) => (
                  <div key={i} className="flex-1 min-w-[120px] py-3 text-center border-r border-border last:border-r-0">
                    <div className={`text-xs font-semibold uppercase ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg mt-0.5 ${i === 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Body (Grid) */}
              <div className="flex w-fit min-w-full" style={{ height: `${24 * 60}px` }}> 
                
                {/* Time Labels - Frozen to Left */}
                <div className="w-16 flex-shrink-0 border-r border-border bg-card relative sticky left-0 z-30">
                  {hours.map(hour => (
                    <div key={hour} className="absolute w-full text-right pr-2 text-xs text-muted-foreground -translate-y-1/2" style={{ top: `${hour * 60}px` }}>
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {days.map((day, dayIndex) => {
                  
                  // Filter and sort events for this day
                  const dayEventsRaw = events
                    .filter(e => e.start.getDate() === day.getDate() && e.start.getMonth() === day.getMonth())
                    .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime())

                  // ALGORITHM: Find overlapping clusters to calculate columns
                  const eventClusters: CalendarEvent[][] = []
                  let currentCluster: CalendarEvent[] = []
                  let clusterEnd = 0

                  dayEventsRaw.forEach(evt => {
                    if (currentCluster.length === 0 || evt.start.getTime() < clusterEnd) {
                      currentCluster.push(evt)
                      clusterEnd = Math.max(clusterEnd, evt.end.getTime())
                    } else {
                      eventClusters.push([...currentCluster])
                      currentCluster = [evt]
                      clusterEnd = evt.end.getTime()
                    }
                  })
                  if (currentCluster.length > 0) eventClusters.push(currentCluster)

                  // ALGORITHM: Assign column indexes
                  const renderedEvents: { evt: CalendarEvent, colIdx: number, totalCols: number }[] = []
                  eventClusters.forEach(cluster => {
                    const cols: number[] = []
                    cluster.forEach(evt => {
                      let colIdx = 0
                      while (cols[colIdx] !== undefined && cols[colIdx] > evt.start.getTime()) {
                        colIdx++
                      }
                      cols[colIdx] = evt.end.getTime()
                      renderedEvents.push({ evt, colIdx, totalCols: 1 }) // temporary total
                    })
                    const maxCols = cols.length
                    // Backfill max columns for the current cluster
                    for (let i = renderedEvents.length - cluster.length; i < renderedEvents.length; i++) {
                      renderedEvents[i].totalCols = maxCols
                    }
                  })

                  return (
                    <div key={dayIndex} className="flex-1 min-w-[120px] border-r border-border last:border-r-0 relative">
                      {/* Grid Lines */}
                      {hours.map(hour => (
                        <div key={hour} className="absolute w-full border-t border-border/50" style={{ top: `${hour * 60}px`, height: '60px' }} />
                      ))}

                      {/* Current Time Indicator (Only on Today) */}
                      {dayIndex === 0 && (
                        <div 
                          className="absolute w-full z-20 flex items-center pointer-events-none"
                          style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                        >
                          <div className="w-2 h-2 rounded-full bg-destructive -ml-1 absolute" />
                          <div className="w-full border-t-2 border-destructive" />
                        </div>
                      )}

                      {/* Events Rendered */}
                      {renderedEvents.map(({ evt, colIdx, totalCols }, evtIndex) => {
                        const top = evt.start.getHours() * 60 + evt.start.getMinutes()
                        const duration = (evt.end.getTime() - evt.start.getTime()) / 60000
                        
                        // Calculate width and position dynamically
                        const widthPct = 100 / totalCols
                        const leftPct = widthPct * colIdx
                        
                        return (
                          <a
                            key={evtIndex}
                            href={evt.link}
                            target="_blank"
                            rel="noreferrer"
                            // Added hover:!w-[] and hover:!left-[] to override inline styles and expand on hover
                            className="absolute rounded-md p-1.5 overflow-hidden transition-all duration-200 hover:!w-[calc(100%-4px)] hover:!left-[2px] hover:z-40 hover:ring-2 ring-primary/50 group block text-left shadow-sm"
                            style={{ 
                              top: `${top}px`, 
                              height: `${Math.max(duration - 2, 20)}px`, // -2 for tiny gap, 20px min-height
                              width: `calc(${widthPct}% - 4px)`,
                              left: `calc(${leftPct}% + 2px)`,
                              background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                              zIndex: 10 + colIdx // ensures overlapping layer logic
                            }}
                          >
                            <div className="text-[10px] sm:text-xs font-bold leading-tight text-primary-foreground line-clamp-2">
                              {evt.name}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-primary-foreground/90 mt-0.5 flex items-center justify-between">
                              <span>
                                {evt.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[8px] uppercase tracking-wider text-primary-foreground/70 mt-1">
                              {evt.type}
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}

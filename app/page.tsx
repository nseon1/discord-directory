"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { supabase } from "./supabaseClient" // Adjust path if needed
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Moon, 
  Sun, 
  Menu, 
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  Info,
  HelpCircle,
  Heart,
  Users,
  Sparkles,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

const SERVERS_URL = "/servers.json";
const TSNE_URL = "/tsne.json";

interface Server {
  name: string
  score?: number
  seon_score?: number        
  community_count?: number    
  "short desc"?: string
  tags?: string[]
  notes?: string
  link?: string
  tsne_x?: number
  tsne_y?: number
}

// Score-based color function
const getScoreColor = (score: number): string => {
  if (score >= 7) return "var(--score-excellent)" // green
  if (score >= 6) return "var(--score-good)" // yellow
  if (score >= 5) return "var(--score-medium)" // orange
  return "var(--score-low)" // red
}

const getScoreColorHex = (score: number, isDark: boolean): string => {
  if (score >= 7) return isDark ? "#4ade80" : "#22c55e" // green
  if (score >= 6) return isDark ? "#fde047" : "#eab308" // yellow
  if (score >= 5) return isDark ? "#fb923c" : "#f97316" // orange
  return isDark ? "#f87171" : "#ef4444" // red
}

// Deterministic pseudo-random for consistent positioning
const hashStr = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  return Math.abs(hash)
}
const pseudoRand = (str: string) => (hashStr(str) % 1000) / 1000

// Activity detection (still useful for some features)
const ACTIVITY_ORDER = ["very active", "active", "semi active", "mostly inactive", "dead", "dead.", "dead "]
const activityRank = (t: string) => {
  const i = ACTIVITY_ORDER.findIndex((a) => t.toLowerCase().includes(a.replace(".", "")))
  return i === -1 ? 99 : i
}
const getActivity = (s: Server) => {
  if (!s.tags?.length) return "unknown"
  return s.tags.reduce((b, t) => (activityRank(t) < activityRank(b) ? t : b), s.tags[0])
}

// Tag categories for sorting - Activity keeps original order, others sorted alphabetically
const TAG_CATEGORIES: Record<string, string[]> = {
  "Activity": ["very active", "active", "semi active", "inactive", "dead"],
  "Opportunities?": [
    "community projects",
    "company projects", 
    "github projects",
    "irl opportunities",
    "jobs board",
    "opportunities board",
  ],
  "Reading Groups?": [
    "applied reading group/showcase",
    "office hours/chat/working group",
    "other reading group",
    "research paper reading group",
  ],
  "Server Type": [
    "ai safety",
    "alignment",
    "casual",
    "conference",
    "crypto",
    "education",
    "fellowship",
    "general",
    "hackathon",
    "paper reading",
    "research",
    "special",
    "tool",
  ],
  "Server Vibes": [
    "github project",
    "grad+industry chat",
    "opensci lab",
    "study group",
    "working group",
  ],
  "AI or Science?": [
    "ai",
    "science",
  ],
  "Other": [
    "active creator",
    "irl based",
    "paid",
    "partly irl",
    "semi active creator",
  ],
}

const categorizeTag = (tag: string): string => {
  const lower = tag.toLowerCase().trim()
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.some(t => lower === t || lower.includes(t))) return category
  }
  return "Other"
}

function Tooltip({
  server,
  x,
  y,
  containerW,
  containerH,
  isDark,
}: {
  server: Server | null
  x: number
  y: number
  containerW: number
  containerH: number
  isDark: boolean
}) {
  if (!server) return null
  const W = 280,
    H = 180
  let tx = x + 14,
    ty = y - 10
  if (tx + W > containerW) tx = x - W - 14
  if (ty + H > containerH) ty = y - H
  ty = Math.max(4, ty)
  
  return (
    <div
      className="absolute pointer-events-none z-50 bevel-border"
      style={{
        left: tx,
        top: ty,
        width: W,
        background: isDark 
          ? "linear-gradient(135deg, hsl(40 10% 12%) 0%, hsl(40 8% 10%) 100%)"
          : "linear-gradient(135deg, hsl(45 30% 98%) 0%, hsl(45 20% 95%) 100%)",
        border: `1px solid ${isDark ? "hsl(45 30% 25%)" : "hsl(45 30% 80%)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: isDark 
          ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.1)"
          : "0 8px 32px rgba(0,0,0,0.12), 0 0 20px rgba(212,175,55,0.08)",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div className="font-bold mb-1 text-foreground text-[15px]">{server.name}</div>
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="font-semibold"
          style={{ color: getScoreColorHex(server.score || 0, isDark) }}
        >
          Score: {server.score || 0}
        </span>
      </div>
      {server["short desc"] && (
        <div className="text-muted-foreground mb-2 text-xs">
          {server["short desc"]}
        </div>
      )}
      {server.notes && (
        <div className="text-muted-foreground text-[11px] opacity-80">
          {server.notes.slice(0, 120)}
          {server.notes.length > 120 ? "..." : ""}
        </div>
      )}
    </div>
  )
}

type TagFilterState = null | true | false
type DescriptionSource = "short" | "notes" | "both"

function applyTagFilters(data: Server[], tagFilters: Record<string, TagFilterState>): Server[] {
  return data.filter((s) => {
    for (const [tag, state] of Object.entries(tagFilters)) {
      if (state === null) continue
      const has = (s.tags || []).some((st) => st.toLowerCase() === tag.toLowerCase())
      if (state === true && !has) return false
      if (state === false && has) return false
    }
    return true
  })
}

function AdvancedFiltersDropdown({
  allTags,
  tagFilters,
  setTagFilters,
  hiddenTags,
  setHiddenTags,
}: {
  allTags: string[]
  tagFilters: Record<string, TagFilterState>
  setTagFilters: React.Dispatch<React.SetStateAction<Record<string, TagFilterState>>>
  hiddenTags: Set<string>
  setHiddenTags: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const [showHideMenu, setShowHideMenu] = useState(false)

  const toggleTag = (t: string) => {
    setTagFilters((prev) => {
      const current = prev[t] ?? null
      let next: TagFilterState
      if (current === null) next = true
      else if (current === true) next = false
      else next = null
      return { ...prev, [t]: next }
    })
  }

  const toggleHideTag = (t: string) => {
    setHiddenTags(prev => {
      const newSet = new Set(prev)
      if (newSet.has(t)) newSet.delete(t)
      else newSet.add(t)
      return newSet
    })
  }

  // Sort tags by category
const sortedTags = useMemo(() => {
    const categorized: Record<string, string[]> = {
      "Activity": [],
      "Opportunities?": [],
      "Reading Groups?": [],
      "Server Type": [],
      "Server Vibes": [],
      "AI or Science?": [],
      "Other": [],
    }
    allTags.forEach(tag => {
      const cat = categorizeTag(tag)
      if (categorized[cat]) {
        categorized[cat].push(tag)
      } else {
        categorized["Other"].push(tag)
      }
    })
    // Sort all categories alphabetically EXCEPT Activity which keeps its original order
    Object.keys(categorized).forEach(cat => {
      if (cat !== "Activity") {
        categorized[cat].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      } else {
        // For Activity, sort by the predefined order in TAG_CATEGORIES
        const activityOrder = TAG_CATEGORIES["Activity"]
        categorized[cat].sort((a, b) => {
          const aIndex = activityOrder.findIndex(t => a.toLowerCase().includes(t))
          const bIndex = activityOrder.findIndex(t => b.toLowerCase().includes(t))
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
        })
      }
    })
    return categorized
  }, [allTags])

  const activeFiltersCount = Object.values(tagFilters).filter(v => v !== null).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-border bg-card hover:bg-accent bevel-border">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto scrollbar-gold bg-popover border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Click: must have (+) | Double-click: exclude (-) | Third-click: reset
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(sortedTags).map(([category, tags]) => tags.length > 0 && (
          <div key={category}>
            <DropdownMenuLabel className="text-xs font-semibold text-gold-dark">{category}</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1.5 px-2 pb-2">
              {tags.filter(t => !hiddenTags.has(t)).map(tag => {
                const state = tagFilters[tag] ?? null
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all bevel-border ${
                      state === true
                        ? "bg-score-excellent text-primary-foreground"
                        : state === false
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {state === true && "+ "}
                    {state === false && "- "}
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => { e.preventDefault(); setShowHideMenu(!showHideMenu) }}
          className="cursor-pointer"
        >
          <EyeOff className="h-4 w-4 mr-2" />
          Hide/Show Tags
          <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showHideMenu ? "rotate-180" : ""}`} />
        </DropdownMenuItem>
        
        {showHideMenu && (
          <div className="px-2 py-2 space-y-1 max-h-40 overflow-y-auto">
            {allTags.map(tag => (
              <label key={tag} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-accent rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={!hiddenTags.has(tag)}
                  onChange={() => toggleHideTag(tag)}
                  className="w-3 h-3 accent-primary"
                />
                {tag}
              </label>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setTagFilters({})}
          className="text-muted-foreground cursor-pointer"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TsneView({ 
  data, 
  isDark,
  searchQuery,
  setSearchQuery,
}: { 
  data: Server[]
  isDark: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
}) {
  const W = 850,
    H = 600,
    PAD = 50
  const [hovered, setHovered] = useState<Server | null>(null)
  
  // NEW: Track multiple pinned servers instead of just one selected
  const [pinned, setPinned] = useState<Server[]>([]) 
  
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const validData = data.filter((s) => s.tsne_x !== undefined && s.tsne_y !== undefined)
  
  // Find matching servers for search
  const matchingServers = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>()
    const q = searchQuery.toLowerCase()
    return new Set(
      validData
        .filter(s => s.name.toLowerCase().includes(q) || s["short desc"]?.toLowerCase().includes(q))
        .map(s => s.name)
    )
  }, [validData, searchQuery])

  if (validData.length === 0)
    return (
      <div className="text-muted-foreground p-8 text-center bg-card rounded-xl border border-border bevel-border">
        No T-SNE data available for these servers.
      </div>
    )

  const xs = validData.map((s) => s.tsne_x!),
    ys = validData.map((s) => s.tsne_y!)
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys)
  
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const px = (x: number) => PAD + ((x - minX) / rangeX) * (W - 2 * PAD)
  const py = (y: number) => PAD + ((y - minY) / rangeY) * (H - 2 * PAD)
  
  const handleMove = (e: React.MouseEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div className="space-y-4">
      {/* Search bar for T-SNE */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search to highlight servers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
        {matchingServers.size > 0 && (
          <span className="text-sm text-muted-foreground">
            {matchingServers.size} match{matchingServers.size !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      <div className="relative inline-block">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          className="rounded-xl bevel-border"
          style={{ 
            background: isDark 
              ? "linear-gradient(135deg, hsl(40 8% 8%) 0%, hsl(40 6% 12%) 100%)"
              : "linear-gradient(135deg, hsl(45 30% 98%) 0%, hsl(45 20% 94%) 100%)",
            border: `1px solid ${isDark ? "hsl(45 20% 20%)" : "hsl(45 30% 85%)"}`,
            cursor: "crosshair" 
          }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <g key={frac}>
              <line
                x1={PAD + frac * (W - 2 * PAD)}
                y1={PAD}
                x2={PAD + frac * (W - 2 * PAD)}
                y2={H - PAD}
                stroke={isDark ? "hsl(45 15% 20%)" : "hsl(45 20% 88%)"}
                strokeWidth={1}
              />
              <line
                x1={PAD}
                y1={PAD + frac * (H - 2 * PAD)}
                x2={W - PAD}
                y2={PAD + frac * (H - 2 * PAD)}
                stroke={isDark ? "hsl(45 15% 20%)" : "hsl(45 20% 88%)"}
                strokeWidth={1}
              />
            </g>
          ))}
          
          {/* Border */}
          <rect 
            x={PAD} 
            y={PAD} 
            width={W - 2 * PAD} 
            height={H - 2 * PAD} 
            fill="none" 
            stroke={isDark ? "hsl(45 25% 30%)" : "hsl(45 30% 75%)"}
            strokeWidth={1} 
          />
                    {/* Points */}
          {validData.map((s, i) => {
            const cx = px(s.tsne_x!),
              cy = py(s.tsne_y!),
              baseR = 5 + ((s.score || 0) / 10) * 6
            const col = getScoreColorHex(s.score || 0, isDark)
            const isHov = hovered?.name === s.name
            
            // Check if this specific server is pinned
            const isPinned = pinned.some(p => p.name === s.name)
            const isMatch = matchingServers.has(s.name)
            const isHighlighted = (isMatch && searchQuery.trim()) || isPinned
            
            const opacity = searchQuery.trim() ? (isMatch ? 1 : 0.15) : 0.9
            
            return (
              <g key={i}>
                {isHighlighted && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={baseR + 8}
                    fill="none"
                    stroke={col}
                    strokeWidth={3}
                    opacity={0.4}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isPinned || isHov ? baseR + 3 : baseR}
                  fill={col}
                  fillOpacity={opacity}
                  stroke={isPinned || isHov ? (isDark ? "#fff" : "#000") : "transparent"}
                  strokeWidth={isPinned || isHov ? 2 : 0}
                  style={{ cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={() => setHovered(s)}
                  onClick={() => {
                    // Toggle pin state
                    setPinned(prev => 
                      prev.some(p => p.name === s.name) 
                        ? prev.filter(p => p.name !== s.name) 
                        : [...prev, s]
                    )
                  }}
                />
              </g>
            )
          })}
        </svg>
        
        {/* Render all pinned tooltips at their exact dot coordinates */}
        {pinned.map((s, i) => (
          <Tooltip 
            key={`pinned-${i}`} 
            server={s} 
            x={px(s.tsne_x!)} 
            y={py(s.tsne_y!)} 
            containerW={W} 
            containerH={H} 
            isDark={isDark} 
          />
        ))}

        {/* Render hover tooltip (only if it's not already pinned) */}
        {hovered && !pinned.some(p => p.name === hovered.name) && (
          <Tooltip server={hovered} x={mouse.x} y={mouse.y} containerW={W} containerH={H} isDark={isDark} />
        )}
      </div>
      
      {selected && (
        <div className="bg-card rounded-xl p-4 border border-border bevel-border glow-gold">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-bold text-foreground">{selected.name}</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="font-semibold" style={{ color: getScoreColorHex(selected.score || 0, isDark) }}>
                Score: {selected.score || 0}
              </span>
            </div>
            {selected.link && selected.link !== "#" && (
              <a
                href={selected.link}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {selected.notes && (
            <p className="text-muted-foreground mt-2 text-sm">{selected.notes}</p>
          )}
        </div>
      )}
      
      {/* Legend */}
      <div className="flex gap-4 flex-wrap items-center text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(8, isDark) }} />
          7-10 (Excellent)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(6.5, isDark) }} />
          6-6.9 (Good)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(5.5, isDark) }} />
          5-5.9 (Medium)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(3, isDark) }} />
          {"<"}5 (Low)
        </span>
        <span className="ml-auto">Dot size = score | Click to pin</span>
      </div>
    </div>
  )
}

function QuadrantView({ data, isDark }: { data: Server[]; isDark: boolean }) {
  const allTags = useMemo(() => [...new Set(data.flatMap((s) => s.tags || []))].sort(), [data])
  const [axisX, setAxisX] = useState("")
  const [axisY, setAxisY] = useState("")
  const [hovered, setHovered] = useState<Server | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (allTags.length) {
      setAxisX(allTags[0])
      setAxisY(allTags[1] || allTags[0])
    }
  }, [allTags])

  const W = 750,
    H = 550,
    MID = { x: 375, y: 275 },
    PAD = 70
  const hasTag = (s: Server, tag: string) => (s.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase())

  // Even distribution within quadrants using grid-like positioning
  const projected = useMemo(() => {
    // Group servers by quadrant
    const quadrants: { q1: Server[]; q2: Server[]; q3: Server[]; q4: Server[] } = { q1: [], q2: [], q3: [], q4: [] }
    
    data.forEach((s) => {
      const hasX = hasTag(s, axisX)
      const hasY = hasTag(s, axisY)
      if (hasX && hasY) quadrants.q1.push(s)
      else if (!hasX && hasY) quadrants.q2.push(s)
      else if (!hasX && !hasY) quadrants.q3.push(s)
      else quadrants.q4.push(s)
    })

    // Calculate positions for even distribution
    const distributeInQuadrant = (
      servers: Server[],
      xMin: number,
      xMax: number,
      yMin: number,
      yMax: number
    ) => {
      const count = servers.length
      if (count === 0) return []
      
      // Calculate grid dimensions
      const cols = Math.ceil(Math.sqrt(count * (xMax - xMin) / (yMax - yMin)))
      const rows = Math.ceil(count / cols)
      
      const cellW = (xMax - xMin - PAD) / cols
      const cellH = (yMax - yMin - PAD) / rows
      
      return servers.map((s, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        // Add some deterministic jitter
        const jitterX = pseudoRand(s.name + "x") * cellW * 0.6
        const jitterY = pseudoRand(s.name + "y") * cellH * 0.6
        
        return {
          ...s,
          hasX: hasTag(s, axisX),
          hasY: hasTag(s, axisY),
          px: xMin + PAD/2 + col * cellW + cellW/2 + jitterX - cellW * 0.3,
          py: yMin + PAD/2 + row * cellH + cellH/2 + jitterY - cellH * 0.3,
        }
      })
    }

    return [
      ...distributeInQuadrant(quadrants.q1, MID.x, W, 0, MID.y),      // Top-right
      ...distributeInQuadrant(quadrants.q2, 0, MID.x, 0, MID.y),      // Top-left
      ...distributeInQuadrant(quadrants.q3, 0, MID.x, MID.y, H),      // Bottom-left
      ...distributeInQuadrant(quadrants.q4, MID.x, W, MID.y, H),      // Bottom-right
    ]
  }, [data, axisX, axisY])

  const quadrantCounts = useMemo(() => {
    let q1 = 0, q2 = 0, q3 = 0, q4 = 0
    projected.forEach((s) => {
      if (s.hasX && s.hasY) q1++
      else if (!s.hasX && s.hasY) q2++
      else if (!s.hasX && !s.hasY) q3++
      else q4++
    })
    return { q1, q2, q3, q4 }
  }, [projected])

  const handleMove = (e: React.MouseEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const shortTag = (tag: string) => tag.length > 12 ? tag.slice(0, 10) + "..." : tag

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap items-end">
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          X axis tag
          <select
            value={axisX}
            onChange={(e) => setAxisX(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm bevel-border"
          >
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          Y axis tag
          <select
            value={axisY}
            onChange={(e) => setAxisY(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm bevel-border"
          >
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      
      <div className="relative inline-block">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          className="rounded-xl bevel-border"
          style={{ 
            background: isDark 
              ? "linear-gradient(135deg, hsl(40 8% 8%) 0%, hsl(40 6% 12%) 100%)"
              : "linear-gradient(135deg, hsl(45 30% 98%) 0%, hsl(45 20% 94%) 100%)",
            border: `1px solid ${isDark ? "hsl(45 20% 20%)" : "hsl(45 30% 85%)"}`,
            cursor: "crosshair" 
          }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Quadrant backgrounds */}
          <rect x={MID.x} y={0} width={W - MID.x} height={MID.y} fill={isDark ? "hsl(145 30% 12% / 0.3)" : "hsl(145 40% 95%)"} />
          <rect x={0} y={0} width={MID.x} height={MID.y} fill={isDark ? "hsl(210 30% 12% / 0.3)" : "hsl(210 40% 95%)"} />
          <rect x={0} y={MID.y} width={MID.x} height={H - MID.y} fill={isDark ? "hsl(0 0% 15% / 0.3)" : "hsl(0 0% 95%)"} />
          <rect x={MID.x} y={MID.y} width={W - MID.x} height={H - MID.y} fill={isDark ? "hsl(35 30% 12% / 0.3)" : "hsl(35 40% 95%)"} />
          
          {/* Axis lines */}
          <line x1={MID.x} y1={0} x2={MID.x} y2={H} stroke={isDark ? "hsl(45 25% 35%)" : "hsl(45 30% 70%)"} strokeWidth={2} />
          <line x1={0} y1={MID.y} x2={W} y2={MID.y} stroke={isDark ? "hsl(45 25% 35%)" : "hsl(45 30% 70%)"} strokeWidth={2} />
          
          {/* Quadrant labels */}
          <text x={MID.x + 12} y={24} fill={getScoreColorHex(8, isDark)} fontSize={11} fontWeight="600">Has {shortTag(axisX)}</text>
          <text x={MID.x + 12} y={40} fill={getScoreColorHex(8, isDark)} fontSize={11} fontWeight="600">Has {shortTag(axisY)}</text>
          <text x={MID.x + 12} y={56} fill={isDark ? "#888" : "#666"} fontSize={10}>({quadrantCounts.q1})</text>

          <text x={12} y={24} fill={isDark ? "#60a5fa" : "#3b82f6"} fontSize={11} fontWeight="600">No {shortTag(axisX)}</text>
          <text x={12} y={40} fill={isDark ? "#60a5fa" : "#3b82f6"} fontSize={11} fontWeight="600">Has {shortTag(axisY)}</text>
          <text x={12} y={56} fill={isDark ? "#888" : "#666"} fontSize={10}>({quadrantCounts.q2})</text>

          <text x={12} y={MID.y + 24} fill={isDark ? "#888" : "#666"} fontSize={11} fontWeight="600">No {shortTag(axisX)}</text>
          <text x={12} y={MID.y + 40} fill={isDark ? "#888" : "#666"} fontSize={11} fontWeight="600">No {shortTag(axisY)}</text>
          <text x={12} y={MID.y + 56} fill={isDark ? "#666" : "#888"} fontSize={10}>({quadrantCounts.q3})</text>

          <text x={MID.x + 12} y={MID.y + 24} fill={getScoreColorHex(5.5, isDark)} fontSize={11} fontWeight="600">Has {shortTag(axisX)}</text>
          <text x={MID.x + 12} y={MID.y + 40} fill={getScoreColorHex(5.5, isDark)} fontSize={11} fontWeight="600">No {shortTag(axisY)}</text>
          <text x={MID.x + 12} y={MID.y + 56} fill={isDark ? "#888" : "#666"} fontSize={10}>({quadrantCounts.q4})</text>
          
          {/* Points */}
          {projected.map((s, i) => {
            const r = 4 + ((s.score || 0) / 10) * 5
            const col = getScoreColorHex(s.score || 0, isDark)
            const isHov = hovered?.name === s.name
            return (
              <circle
                key={i}
                cx={s.px}
                cy={s.py}
                r={isHov ? r + 3 : r}
                fill={col}
                fillOpacity={0.85}
                stroke={isHov ? (isDark ? "#fff" : "#000") : "transparent"}
                strokeWidth={isHov ? 2 : 0}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
        </svg>
        <Tooltip server={hovered} x={mouse.x} y={mouse.y} containerW={W} containerH={H} isDark={isDark} />
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 flex-wrap items-center text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(8, isDark) }} />
          7-10 (Excellent)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(6.5, isDark) }} />
          6-6.9 (Good)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(5.5, isDark) }} />
          5-5.9 (Medium)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: getScoreColorHex(3, isDark) }} />
          {"<"}5 (Low)
        </span>
        <span className="ml-auto">{data.length} servers | Dot size = score</span>
      </div>
    </div>
  )
}

function ListView({
  data,
  tagFilters,
  setTagFilters,
  hiddenTags,
  setHiddenTags,
  isDark,
  handleVote,
}: {
  data: Server[]
  tagFilters: Record<string, TagFilterState>
  setTagFilters: React.Dispatch<React.SetStateAction<Record<string, TagFilterState>>>
  hiddenTags: Set<string>
  setHiddenTags: React.Dispatch<React.SetStateAction<Set<string>>>
  isDark: boolean
  handleVote: (serverName: string, score: number) => void // <--- And this
}) {
  const [query, setQuery] = useState("")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 10])
  const [compact, setCompact] = useState(false)
  const [sortBy, setSortBy] = useState("score")
  const [compactColumns, setCompactColumns] = useState<string[]>(["score", "tags", "activity"])
  const [descSource, setDescSource] = useState<DescriptionSource>("short")

  const allTags = useMemo(() => [...new Set(data.flatMap((s) => s.tags || []))].sort(), [data])

  const toggleCompactCol = (col: string) =>
    setCompactColumns((p) => (p.includes(col) ? p.filter((x) => x !== col) : [...p, col]))

  const filtered = useMemo(
    () =>
      applyTagFilters(data, tagFilters)
        .filter((s) => {
          const score = s.score || 0
          if (score < scoreRange[0] || score > scoreRange[1]) return false
          if (
            query &&
            !s.name.toLowerCase().includes(query.toLowerCase()) &&
            !(s["short desc"] || "").toLowerCase().includes(query.toLowerCase())
          )
            return false
          return true
        })
        .sort((a, b) => (sortBy === "score" ? (b.score || 0) - (a.score || 0) : a.name.localeCompare(b.name))),
    [data, query, tagFilters, scoreRange, sortBy]
  )

  const compactOptions = [
    { id: "desc", label: "Description" },
    { id: "notes", label: "Notes" },
    { id: "activity", label: "Activity" },
    { id: "score", label: "Score" },
    { id: "tags", label: "Tags" },
  ]

  const getDescription = (s: Server) => {
    if (descSource === "short") return s["short desc"] || ""
    if (descSource === "notes") return s.notes || ""
    return [s["short desc"], s.notes].filter(Boolean).join(" | ")
  }

  const visibleTags = (tags: string[] | undefined) => 
    (tags || []).filter(t => !hiddenTags.has(t))

  return (
    <div className="space-y-4">
      {/* Search and filters row */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        
        <AdvancedFiltersDropdown
          allTags={allTags}
          tagFilters={tagFilters}
          setTagFilters={setTagFilters}
          hiddenTags={hiddenTags}
          setHiddenTags={setHiddenTags}
        />
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-foreground text-sm bevel-border"
        >
          <option value="score">Sort: Score</option>
          <option value="name">Sort: Name</option>
        </select>
        
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={compact}
            onCheckedChange={setCompact}
          />
          Compact
        </label>
      </div>

      {/* Description source toggle (non-compact only) */}
      {!compact && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Show:</span>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["short", "notes", "both"] as DescriptionSource[]).map((src) => (
              <button
                key={src}
                onClick={() => setDescSource(src)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  descSource === src
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {src === "short" ? "Short Desc" : src === "notes" ? "Notes" : "Both"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Score range slider */}
      <div className="bg-card rounded-xl p-4 border border-border bevel-border">
        <div className="text-sm text-muted-foreground mb-3">
          Score range: <span className="text-foreground font-semibold">{scoreRange[0]}</span> -{" "}
          <span className="text-foreground font-semibold">{scoreRange[1]}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">0</span>
          <div className="flex-1 relative h-6 flex items-center">
            <div className="absolute left-0 right-0 h-2 bg-muted rounded-full" />
            <div
              className="absolute h-2 rounded-full"
              style={{
                left: `${(scoreRange[0] / 10) * 100}%`,
                right: `${100 - (scoreRange[1] / 10) * 100}%`,
                background: "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))",
              }}
            />
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={scoreRange[0]}
              onChange={(e) => setScoreRange([Math.min(+e.target.value, scoreRange[1]), scoreRange[1]])}
              className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-lg"
              style={{ zIndex: scoreRange[0] > scoreRange[1] - 1 ? 5 : 3 }}
            />
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={scoreRange[1]}
              onChange={(e) => setScoreRange([scoreRange[0], Math.max(+e.target.value, scoreRange[0])])}
              className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-lg"
              style={{ zIndex: 4 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">10</span>
        </div>
      </div>

      <div className="text-muted-foreground text-sm">{filtered.length} servers</div>

      {compact && (
        <div className="flex gap-3 flex-wrap items-center">
          <span className="text-sm text-muted-foreground">Show columns:</span>
          {compactOptions.map((opt) => (
            <label key={opt.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={compactColumns.includes(opt.id)}
                onChange={() => toggleCompactCol(opt.id)}
                className="w-4 h-4 accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {compact ? (
        <div className="overflow-x-auto rounded-xl border border-border bevel-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground border-b border-border">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                {compactColumns.includes("score") && (
                  <th className="px-4 py-3 text-left font-semibold">Score</th>
                )}
                {compactColumns.includes("activity") && (
                  <th className="px-4 py-3 text-left font-semibold">Activity</th>
                )}
                {compactColumns.includes("desc") && (
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                )}
                {compactColumns.includes("notes") && (
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                )}
                {compactColumns.includes("tags") && (
                  <th className="px-4 py-3 text-left font-semibold">Tags</th>
                )}
                <th className="px-4 py-3 text-left font-semibold">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                  {compactColumns.includes("score") && (
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Owner: <span className="font-semibold" style={{ color: getScoreColorHex(s.seon_score || 0, isDark) }}>{s.seon_score || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground" title={`${s.community_count || 0} votes`}>
                            Comm:
                          </span>
                          <span 
                            className="font-bold text-sm"
                            style={{ color: getScoreColorHex(s.community_count ? (s.score || 0) : 0, isDark) }}
                          >
                            {s.community_count ? s.score : "-"}
                          </span>
                         <input 
  type="number"
  min="1"
  max="10"
  step="0.1"
  placeholder="Rate"
  title="Press Enter to submit"
  className="text-[10px] bg-muted text-muted-foreground border border-border rounded px-1 py-0.5 outline-none hover:border-primary transition-colors w-14"
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      // Parse, round to 1 decimal place, and validate
      const val = Math.round(parseFloat(e.currentTarget.value) * 10) / 10;
      if (!isNaN(val) && val >= 1 && val <= 10) {
        handleVote(s.name, val);
        e.currentTarget.value = "";
      } else {
        alert("Please enter a valid rating between 1 and 10.");
      }
    }
  }}
/>
                        </div>
                      </div>
                    </td>
                  )}                  
                  {compactColumns.includes("activity") && (
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {getActivity(s)}
                      </Badge>
                    </td>
                  )}
                  {compactColumns.includes("desc") && (
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {s["short desc"]?.slice(0, 60) || "-"}
                    </td>
                  )}
                  {compactColumns.includes("notes") && (
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {s.notes?.slice(0, 60) || "-"}
                    </td>
                  )}
                  {compactColumns.includes("tags") && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {visibleTags(s.tags).slice(0, 3).map((tag, ti) => (
                          <Badge key={ti} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {visibleTags(s.tags).length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{visibleTags(s.tags).length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {s.link && s.link !== "#" ? (
                      <a href={s.link} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all bevel-border hover:glow-gold group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-foreground leading-tight">
                  {s.link && s.link !== "#" ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {s.name}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    s.name
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Owner: <span style={{ color: getScoreColorHex(s.seon_score || 0, isDark) }}>{s.seon_score || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold" title={`${s.community_count || 0} votes`}>
                      Comm:
                    </span>
                    <span 
                      className="font-bold text-sm whitespace-nowrap"
                      style={{ color: getScoreColorHex(s.community_count ? (s.score || 0) : 0, isDark) }}
                    >
                      {s.community_count ? s.score : "-"}
                    </span>
<input 
  type="number"
  min="1"
  max="10"
  step="0.1"
  placeholder="Rate"
  title="Press Enter to submit"
  className="text-[10px] bg-muted text-muted-foreground border border-border rounded px-1 py-0.5 outline-none hover:border-primary transition-colors w-14"
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      // Parse, round to 1 decimal place, and validate
      const val = Math.round(parseFloat(e.currentTarget.value) * 10) / 10;
      if (!isNaN(val) && val >= 1 && val <= 10) {
        handleVote(s.name, val);
        e.currentTarget.value = "";
      } else {
        alert("Please enter a valid rating between 1 and 10.");
      }
    }
  }}
/>
                  </div>
                </div>              
              {getDescription(s) && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {getDescription(s)}
                </p>
              )}
              
              {/* Show ALL visible tags */}
              <div className="flex flex-wrap gap-1.5">
                {visibleTags(s.tags).map((tag, ti) => (
                  <Badge key={ti} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Navigation header component
function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    // You can change 'discord' to 'google' if you prefer!
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 px-4 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center bevel-border">
              <span className="font-bold text-primary-foreground tracking-wide">labsxiv</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Research community Directory</h1>
              <p className="text-xs text-muted-foreground">Discover non-university research communities</p>
            </div>
          </div>
           <div className="flex items-center gap-2">
            {/*  Projects */}
            <Button variant="outline" size="sm" asChild className="bevel-border hidden sm:flex">
              <Link href="/projects">
                Projects
              </Link>
            </Button>
             {/* Reading Groups (Desktop) */}
            <Button variant="outline" size="sm" asChild className="bevel-border hidden sm:flex">
              <Link href="/readinggroups">
                Reading Groups
              </Link>
            </Button>
          <div className="flex items-center gap-2">
            {/* Login , Logout Button */}
            {mounted && (
              user ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="bevel-border">
                  Logout
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={handleLogin} className="bevel-border glow-gold">
                  Sign In
                </Button>
              )
            )}

            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Navigation menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bevel-border">
                  <Menu className="h-4 w-4" />
                  Menu
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Dropdown link for mobile/menu */}
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/projects" className="cursor-pointer">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Projects
                  </Link>
                </DropdownMenuItem>
                {/* NEW: Reading Groups (Mobile) */}
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/readinggroups" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Reading Groups
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="sm:hidden" />

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

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState("list")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 10])
  const [tagFilters, setTagFilters] = useState<Record<string, TagFilterState>>({})
  const [hiddenTags, setHiddenTags] = useState<Set<string>>(new Set())
  const [tsneSearch, setTsneSearch] = useState("")

  const isDark = mounted ? resolvedTheme === "dark" : true

  useEffect(() => {
    setMounted(true)
  }, [])

  const allTags = useMemo(() => [...new Set(data.flatMap((s) => s.tags || []))].sort(), [data])

useEffect(() => {
  Promise.all([
    fetch(SERVERS_URL).then((r) => {
      if (!r.ok) throw new Error("Failed to load servers.json")
      return r.json()
    }),
    fetch(TSNE_URL).then((r) => {
      if (!r.ok) throw new Error("Failed to load servers_tsne.json")
      return r.json()
    }),
    supabase.from('votes').select('server_name, score') // Fetch community votes
  ])
    .then(([serversData, tsneData, { data: votesData, error: votesError }]) => {
      if (votesError) console.error("Error fetching votes:", votesError)
      
      // Calculate average scores
      const averages: Record<string, { total: number, count: number }> = {}
      if (votesData) {
        votesData.forEach(vote => {
          if (!averages[vote.server_name]) averages[vote.server_name] = { total: 0, count: 0 }
          averages[vote.server_name].total += vote.score
          averages[vote.server_name].count += 1
        })
      }

      const mergedData = serversData.map((server: Server) => {
        const mapping = tsneData.find(
          (t: { name?: string; tsne_x?: number; tsne_y?: number }) =>
            (t.name || "").toLowerCase() === (server.name || "").toLowerCase()
        )
        
        const commData = averages[server.name]
        const communityAvg = commData 
          ? Number((commData.total / commData.count).toFixed(1))
          : server.score // Fallback for sorting purposes

        return {
          ...server,
          seon_score: server.score, // Save your original score!
          score: communityAvg,      // Use community score for general sorting/sizing
          community_count: commData ? commData.count : 0, // Keep track of votes
          tsne_x: mapping?.tsne_x,
          tsne_y: mapping?.tsne_y,
        }
      })
      setData(mergedData)
      setLoading(false)
    })
    .catch((e) => {
      setError(e.message)
      setLoading(false)
    })
}, [])

  const visibleData = useMemo(
    () =>
      applyTagFilters(
        data.filter((s) => (s.score || 0) >= scoreRange[0] && (s.score || 0) <= scoreRange[1]),
        tagFilters
      ),
    [data, scoreRange, tagFilters]
  )

  const handleVote = async (serverName: string, score: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert("Please sign in to vote!")
      return
    }

    const { error } = await supabase
      .from('votes')
      .upsert({ 
        server_name: serverName, 
        user_id: session.user.id, 
        score: score 
      }, { onConflict: 'server_name, user_id' })

    if (error) {
      console.error("Error voting:", error)
      alert("Failed to save vote.")
    } else {
      alert(`Successfully rated ${serverName} a ${score}/10! (Refresh to see updated global averages)`)
      // You could write extra code here to instantly update the `data` state, 
      // but a page refresh is easiest for now to recalculate all the averages!
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading servers...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-xl bg-destructive/20 flex items-center justify-center">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium">Failed to load: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "list", label: "List View" },
    { id: "tsne", label: "T-SNE Map" },
    { id: "quad", label: "Quadrant" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border bevel-border">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-foreground">{data.length}</span>
            <span className="text-muted-foreground">servers</span>
          </div>
          {(view === "tsne" || view === "quad") && (
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border bevel-border">
              <span className="text-muted-foreground">Showing:</span>
              <span className="font-bold text-foreground">{visibleData.length}</span>
            </div>
          )}
        </div>

        {/* View tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              onClick={() => setView(tab.id)}
              variant={view === tab.id ? "default" : "outline"}
              className={`bevel-border ${view === tab.id ? "glow-gold" : ""}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Global filters for T-SNE and Quadrant views */}
        {(view === "tsne" || view === "quad") && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <AdvancedFiltersDropdown
                allTags={allTags}
                tagFilters={tagFilters}
                setTagFilters={setTagFilters}
                hiddenTags={hiddenTags}
                setHiddenTags={setHiddenTags}
              />
            </div>
            
            {/* Score range */}
            <div className="bg-card rounded-xl p-4 border border-border bevel-border max-w-md">
              <div className="text-sm text-muted-foreground mb-3">
                Score range: <span className="text-foreground font-semibold">{scoreRange[0]}</span> -{" "}
                <span className="text-foreground font-semibold">{scoreRange[1]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">0</span>
                <div className="flex-1 relative h-6 flex items-center">
                  <div className="absolute left-0 right-0 h-2 bg-muted rounded-full" />
                  <div
                    className="absolute h-2 rounded-full"
                    style={{
                      left: `${(scoreRange[0] / 10) * 100}%`,
                      right: `${100 - (scoreRange[1] / 10) * 100}%`,
                      background: "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))",
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={scoreRange[0]}
                    onChange={(e) => setScoreRange([Math.min(+e.target.value, scoreRange[1]), scoreRange[1]])}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-lg"
                    style={{ zIndex: scoreRange[0] > scoreRange[1] - 1 ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={scoreRange[1]}
                    onChange={(e) => setScoreRange([scoreRange[0], Math.max(+e.target.value, scoreRange[0])])}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-lg"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">10</span>
              </div>
            </div>
          </div>
        )}

        {/* View content */}
        {view === "tsne" && (
          <TsneView 
            data={visibleData} 
            isDark={isDark} 
            searchQuery={tsneSearch}
            setSearchQuery={setTsneSearch}
          />
        )}
        {view === "quad" && <QuadrantView data={visibleData} isDark={isDark} />}
        {view === "list" && (
          <ListView 
            data={data} 
            tagFilters={tagFilters} 
            setTagFilters={setTagFilters}
            hiddenTags={hiddenTags}
            setHiddenTags={setHiddenTags}
            isDark={isDark}
            handleVote={handleVote}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Research community Directory - Find your community</p>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/credits" className="hover:text-foreground transition-colors">Credits</Link>
              <Link href="/donations" className="hover:text-foreground transition-colors">Donate</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

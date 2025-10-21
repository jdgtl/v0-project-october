"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  ChevronDown,
  Download,
  Lock,
  Settings,
  Share2,
  Sparkles,
  TrendingUp,
  User,
  Heart,
  Zap,
  Award,
  MapPin,
  Clock,
  DollarSign,
  Link2,
  Shield,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const mockMerchants = [
  { id: 1, name: "Blue Bottle Coffee", visits: 12, amount: 340, category: "coffee", isLocal: true },
  { id: 2, name: "Whole Foods", visits: 8, amount: 520, category: "grocery", isSustainable: true },
  {
    id: 3,
    name: "Local Bookshop",
    visits: 6,
    amount: 180,
    category: "retail",
    isLocal: true,
    isMinority: true,
  },
  {
    id: 4,
    name: "Farmers Market",
    visits: 10,
    amount: 280,
    category: "grocery",
    isLocal: true,
    isSustainable: true,
  },
  { id: 5, name: "Corner Bakery", visits: 5, amount: 150, category: "food", isLocal: true },
  { id: 6, name: "Green Grocer", visits: 4, amount: 120, category: "grocery", isLocal: true, isSustainable: true },
  { id: 7, name: "Art Gallery", visits: 2, amount: 80, category: "retail", isLocal: true },
  { id: 8, name: "Yoga Studio", visits: 3, amount: 90, category: "wellness", isMinority: true },
]

const categoryColors: Record<string, string> = {
  coffee: "bg-amber-600",
  grocery: "bg-green-600",
  retail: "bg-blue-600",
  food: "bg-orange-600",
  wellness: "bg-teal-600",
  default: "bg-purple-600",
}

const mockProofs = [
  {
    id: 1,
    title: "Local Loyalist",
    description: "Spent 78% locally in March",
    badge: "🏪",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Sustainability Champion",
    description: "Supported 12 eco-friendly businesses",
    badge: "🌱",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    title: "Community Builder",
    description: "Supported 8 minority-owned businesses",
    badge: "🤝",
    color: "from-purple-500 to-pink-500",
  },
]

type DateRange = "last30" | "thisMonth" | "custom"

export default function UnifiedDashboard() {
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [showConnectionModal, setShowConnectionModal] = useState(false)

  const [blurAmounts, setBlurAmounts] = useState(true)
  const [aiInsights, setAiInsights] = useState(true)
  const [shareProofs, setShareProofs] = useState(true)
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>("thisMonth")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isMintingProof, setIsMintingProof] = useState(false)
  const [mintedProof, setMintedProof] = useState<(typeof mockProofs)[0] | null>(null)

  useEffect(() => {
    // Simulate checking for connected accounts
    // In production, this would check Supabase for linked Plaid accounts
    const checkAccounts = async () => {
      // Mock: No accounts connected initially
      const accountsExist = false
      if (!accountsExist) {
        setShowConnectionModal(true)
      } else {
        setHasConnectedAccounts(true)
      }
    }
    checkAccounts()
  }, [])

  const handleConnectAccount = () => {
    // In production, this would open Plaid Link
    console.log("[v0] Opening Plaid Link...")
    setIsLoading(true)
    setSyncProgress(0)

    // Simulate Plaid connection and sync
    const syncInterval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(syncInterval)
          setIsLoading(false)
          setHasConnectedAccounts(true)
          setShowConnectionModal(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const toggleValue = (value: string) => {
    setSelectedValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const filteredMerchants = mockMerchants.filter((m) => {
    if (selectedValues.length === 0) return true
    return (
      (selectedValues.includes("local") && m.isLocal) ||
      (selectedValues.includes("sustainable") && m.isSustainable) ||
      (selectedValues.includes("minority") && m.isMinority)
    )
  })

  const handleMintProof = (proof: (typeof mockProofs)[0]) => {
    setIsMintingProof(true)
    setTimeout(() => {
      setIsMintingProof(false)
      setMintedProof(proof)
    }, 2000)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "last30":
        return "Last 30 Days"
      case "thisMonth":
        return "This Month"
      case "custom":
        return "Custom Range"
    }
  }

  if (showConnectionModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2">Connect Your Account to Get Started</DialogTitle>
              <DialogDescription>
                We'll analyze your transactions to show your spending identity and values
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Trust Signals */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Bank-level security with Plaid</h4>
                    <p className="text-sm text-muted-foreground">
                      Your credentials are encrypted and never stored on our servers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Privacy by default</h4>
                    <p className="text-sm text-muted-foreground">
                      Your amounts are blurred by default and you control all data sharing
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <X className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Delete anytime</h4>
                    <p className="text-sm text-muted-foreground">
                      You can disconnect and delete all your data whenever you want
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Button */}
              {!isLoading ? (
                <Button size="lg" className="w-full" onClick={handleConnectAccount}>
                  <Link2 className="h-5 w-5 mr-2" />
                  Connect Your First Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Syncing your transactions...</span>
                    <span className="font-medium">{syncProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${syncProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">This usually takes 30-60 seconds</p>
                </div>
              )}

              {/* Why We Need This */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Why we need this
                </summary>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Project October analyzes your transaction data to show you insights about your spending identity,
                  values alignment, and community impact. Without access to your transactions, we can't provide any of
                  these features.
                </p>
              </details>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isLoading || !hasConnectedAccounts) {
    return (
      <div className="min-h-screen bg-background">
        {/* NavBar */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Project October</h1>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Syncing...</span>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          {/* Skeleton Hero */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-10 w-10 bg-muted rounded-lg mb-3 animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded mb-2 animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </Card>
            ))}
          </div>

          {/* Skeleton Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="h-6 w-40 bg-muted rounded mb-4 animate-pulse" />
                <div className="h-96 bg-muted rounded animate-pulse" />
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="h-6 w-32 bg-muted rounded mb-4 animate-pulse" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* NavBar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold">Project October</h1>

            {/* Date Range Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  {getDateRangeLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  <Button
                    variant={dateRange === "last30" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setDateRange("last30")
                      setIsDatePickerOpen(false)
                    }}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant={dateRange === "thisMonth" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setDateRange("thisMonth")
                      setIsDatePickerOpen(false)
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    variant={dateRange === "custom" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setDateRange("custom")
                      setIsDatePickerOpen(false)
                    }}
                  >
                    Custom Range
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Sheet>
                <SheetTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Lock className="mr-2 h-4 w-4" />
                    Privacy & Data
                  </DropdownMenuItem>
                </SheetTrigger>
                <SheetContent className="p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">Privacy & Data Control</SheetTitle>
                    <p className="text-sm text-muted-foreground">You have complete control over your data</p>
                  </SheetHeader>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 py-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">Blur Amounts</h3>
                        <p className="text-sm text-muted-foreground">Hide sensitive financial data</p>
                      </div>
                      <Switch checked={blurAmounts} onCheckedChange={setBlurAmounts} />
                    </div>

                    <div className="flex items-start justify-between gap-4 py-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">AI Insights</h3>
                        <p className="text-sm text-muted-foreground">Generate spending narratives</p>
                      </div>
                      <Switch checked={aiInsights} onCheckedChange={setAiInsights} />
                    </div>

                    <div className="flex items-start justify-between gap-4 py-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">Share Proofs</h3>
                        <p className="text-sm text-muted-foreground">Allow proof generation</p>
                      </div>
                      <Switch checked={shareProofs} onCheckedChange={setShareProofs} />
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Export My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <Lock className="h-4 w-4" />
                      Connected Accounts
                    </Button>
                  </div>

                  <div className="mt-6">
                    <Button variant="destructive" className="w-full">
                      Delete All Data
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Snapshot - Identity Lens */}
        <motion.div
          key={dateRange}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-medium">Local Loyalist</h3>
              </div>
              <div className="text-3xl font-bold mb-1">78%</div>
              <p className="text-sm text-muted-foreground">of spending local</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-medium">Explorer Score</h3>
              </div>
              <div className="text-3xl font-bold mb-1">8.2</div>
              <p className="text-sm text-muted-foreground">new places discovered</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Heart className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-medium">Gave Forward</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{blurAmounts ? "•••" : "$247"}</div>
              <p className="text-sm text-muted-foreground">to community causes</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-medium">Consistency Streak</h3>
              </div>
              <div className="text-3xl font-bold mb-1">12</div>
              <p className="text-sm text-muted-foreground">days supporting local</p>
            </Card>
          </div>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Narrative Card - Your Month in Moments */}
            <motion.div
              key={`narrative-${dateRange}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Your Month in Moments</h2>
                </div>
                {aiInsights ? (
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>
                      You discovered <span className="font-medium text-foreground">2 new coffee shops</span> and
                      revisited your favorite <span className="font-medium text-foreground">6 times</span>. Your morning
                      ritual at Blue Bottle has become a cornerstone of your routine.
                    </p>
                    <p>
                      This month, you supported{" "}
                      <span className="font-medium text-foreground">8 minority-owned businesses</span> and spent{" "}
                      <span className="font-medium text-foreground">78% locally</span>. Your neighborhood economy is
                      stronger because of your choices.
                    </p>
                    <p>
                      You're building relationships with{" "}
                      <span className="font-medium text-foreground">4 regular spots</span> where they know your name.
                      That's community in action.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Enable AI Insights to see your spending story</p>
                )}
              </Card>
            </motion.div>

            {/* Taste Graph */}
            <motion.div
              key={`taste-${dateRange}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Taste Graph</h2>
                  <div className="flex gap-2">
                    <Badge
                      variant={selectedValues.includes("local") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleValue("local")}
                    >
                      🏪 Local
                    </Badge>
                    <Badge
                      variant={selectedValues.includes("sustainable") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleValue("sustainable")}
                    >
                      🌱 Sustainable
                    </Badge>
                    <Badge
                      variant={selectedValues.includes("minority") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleValue("minority")}
                    >
                      🤝 Minority-Owned
                    </Badge>
                  </div>
                </div>

                <div className="relative h-96 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center p-8">
                  <AnimatePresence>
                    {(() => {
                      // Sort merchants by amount (largest first)
                      const sortedMerchants = [...filteredMerchants].sort((a, b) => b.amount - a.amount)

                      // Calculate bubble sizes
                      const maxAmount = Math.max(...sortedMerchants.map((m) => m.amount))
                      const minSize = 60
                      const maxSize = 140

                      // Circle packing algorithm - places bubbles touching each other
                      const positions: { x: number; y: number; radius: number }[] = []

                      sortedMerchants.forEach((merchant, index) => {
                        const size = minSize + (merchant.amount / maxAmount) * (maxSize - minSize)
                        const radius = size / 2

                        if (index === 0) {
                          // Place first (largest) bubble at center
                          positions.push({ x: 50, y: 50, radius })
                        } else {
                          // Find position where bubble touches existing bubbles
                          let bestPosition = { x: 50, y: 50 }
                          let bestDistance = Number.POSITIVE_INFINITY

                          // Try positions around each existing bubble
                          for (const existingPos of positions) {
                            // Try multiple angles around this bubble
                            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
                              // Calculate position where new bubble touches existing bubble
                              const distance = (existingPos.radius + radius) / 4 // Convert to percentage space
                              const testX = existingPos.x + Math.cos(angle) * distance
                              const testY = existingPos.y + Math.sin(angle) * distance

                              // Check if this position overlaps with any other bubble
                              let overlaps = false
                              for (const otherPos of positions) {
                                const dx = testX - otherPos.x
                                const dy = testY - otherPos.y
                                const dist = Math.sqrt(dx * dx + dy * dy)
                                const minDist = (radius + otherPos.radius) / 4 - 0.1 // Small tolerance

                                if (dist < minDist) {
                                  overlaps = true
                                  break
                                }
                              }

                              // If no overlap, check if this is closer to center than current best
                              if (!overlaps) {
                                const distToCenter = Math.sqrt((testX - 50) ** 2 + (testY - 50) ** 2)
                                if (distToCenter < bestDistance) {
                                  bestDistance = distToCenter
                                  bestPosition = { x: testX, y: testY }
                                }
                              }
                            }
                          }

                          positions.push({ x: bestPosition.x, y: bestPosition.y, radius })
                        }
                      })

                      return sortedMerchants.map((merchant, index) => {
                        const pos = positions[index]
                        const size = minSize + (merchant.amount / maxAmount) * (maxSize - minSize)

                        return (
                          <motion.div
                            key={merchant.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="absolute"
                            style={{
                              left: `${pos.x}%`,
                              top: `${pos.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <div
                              className={`rounded-full ${categoryColors[merchant.category] || categoryColors.default} flex flex-col items-center justify-center text-white font-medium cursor-pointer hover:scale-110 transition-all shadow-lg hover:shadow-xl`}
                              style={{
                                width: size,
                                height: size,
                              }}
                              title={`${merchant.name} - ${merchant.visits} visits - $${merchant.amount}`}
                            >
                              <div className="text-center px-3">
                                <div className="text-sm font-semibold leading-tight mb-1">{merchant.name}</div>
                                <div className="text-xs opacity-90">{merchant.visits} visits</div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    })()}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* Rhythms Heatmap */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Your Spending Rhythms</h2>
              <div className="space-y-2">
                <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                  <div className="w-12"></div>
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="w-4 text-center">
                      {i % 6 === 0 ? i : ""}
                    </div>
                  ))}
                </div>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dayIndex) => (
                  <div key={day} className="flex gap-2 items-center">
                    <div className="w-12 text-xs text-muted-foreground">{day}</div>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const cell = mockHeatmap.find((h) => h.day === dayIndex && h.hour === hour)
                      const intensity = cell?.value || 0

                      const getColorClass = () => {
                        if (intensity === 0) return "bg-muted"
                        if (intensity === 1) return "bg-primary/30"
                        if (intensity === 2) return "bg-primary/50"
                        if (intensity === 3) return "bg-primary/70"
                        return "bg-primary/90"
                      }

                      return (
                        <div
                          key={hour}
                          className={`w-4 h-4 rounded-sm transition-colors hover:ring-2 hover:ring-primary/50 ${getColorClass()}`}
                          title={`${day} ${hour}:00 - ${intensity > 0 ? `${intensity} transactions` : "No activity"}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Darker cells indicate more spending activity</p>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Relationship Health Stack */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Relationship Health</h2>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="patrons">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <h3 className="font-medium">Patrons (5+ visits)</h3>
                      <Badge variant="secondary">4 places</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Blue Bottle Coffee", "Farmers Market", "Whole Foods", "Corner Bakery"].map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="regulars">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <h3 className="font-medium">Regulars (3-4 visits)</h3>
                      <Badge variant="secondary">2 places</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Local Bookshop", "Green Grocer"].map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="first-timers">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <h3 className="font-medium">First Timers (1-2 visits)</h3>
                      <Badge variant="secondary">6 places</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["New Cafe", "Art Gallery", "Yoga Studio", "Bike Shop", "Plant Store", "Record Shop"].map(
                        (name) => (
                          <Badge key={name} variant="outline">
                            {name}
                          </Badge>
                        ),
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>

            {/* Proof Center */}
            <motion.div
              key={`proof-${dateRange}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Proof Center</h2>
                </div>

                {shareProofs ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate shareable proofs of your spending values
                    </p>

                    {mockProofs.map((proof) => (
                      <Card key={proof.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className={`text-3xl bg-gradient-to-br ${proof.color} p-3 rounded-lg`}>
                            {proof.badge}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{proof.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{proof.description}</p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 bg-transparent"
                                  onClick={() => handleMintProof(proof)}
                                >
                                  <Sparkles className="h-3 w-3" />
                                  Mint Proof
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Minting Your Proof</DialogTitle>
                                  <DialogDescription>Your shareable proof is being generated</DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center py-8">
                                  {isMintingProof ? (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: [0, 1.2, 1] }}
                                      transition={{ duration: 1.5 }}
                                      className="text-6xl mb-4"
                                    >
                                      {proof.badge}
                                    </motion.div>
                                  ) : (
                                    <>
                                      <div className="text-6xl mb-4">{proof.badge}</div>
                                      <h3 className="text-xl font-semibold mb-2">{proof.title}</h3>
                                      <p className="text-muted-foreground text-center mb-6">{proof.description}</p>
                                      <div className="flex gap-2">
                                        <Button className="gap-2">
                                          <Share2 className="h-4 w-4" />
                                          Share
                                        </Button>
                                        <Button variant="outline" className="gap-2 bg-transparent">
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enable Share Proofs in Privacy Settings to generate badges
                  </p>
                )}
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Total Spent
                  </div>
                  <div className="font-semibold">{blurAmounts ? "•••" : "$2,847"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Places Visited
                  </div>
                  <div className="font-semibold">23</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Transactions
                  </div>
                  <div className="font-semibold">87</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Avg per Day
                  </div>
                  <div className="font-semibold">{blurAmounts ? "•••" : "$95"}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Project October · Your spending, your story, your values</p>
        </div>
      </footer>
    </div>
  )
}

const mockHeatmap = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => {
    // Create realistic spending patterns
    let value = 0
    // Morning coffee (7-9am) on weekdays
    if (hour >= 7 && hour <= 9 && day >= 1 && day <= 5) value = Math.floor(Math.random() * 2) + 3
    // Lunch (12-2pm) every day
    if (hour >= 12 && hour <= 14) value = Math.floor(Math.random() * 2) + 2
    // Dinner (6-8pm) every day
    if (hour >= 18 && hour <= 20) value = Math.floor(Math.random() * 2) + 3
    // Weekend brunch (10am-1pm)
    if (hour >= 10 && hour <= 13 && (day === 0 || day === 6)) value = Math.floor(Math.random() * 2) + 3
    // Late night (10pm-12am) on weekends
    if (hour >= 22 && hour <= 23 && (day === 5 || day === 6)) value = Math.floor(Math.random() * 2) + 2
    // Random sparse activity
    if (value === 0 && Math.random() > 0.9) value = 1

    return { day, hour, value }
  }),
).flat()

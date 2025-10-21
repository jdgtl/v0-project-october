"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts"
import { Store, Coffee, ShoppingBag, UtensilsCrossed } from "lucide-react"

// Mock merchant data
const merchantData = [
  { name: "Blue Bottle Coffee", category: "Coffee", amount: 240, visits: 12, tier: "Patron", color: "#f59e0b" },
  { name: "Whole Foods", category: "Grocery", amount: 380, visits: 8, tier: "Patron", color: "#10b981" },
  { name: "Farmers Market", category: "Grocery", amount: 320, visits: 10, tier: "Patron", color: "#10b981" },
  { name: "Corner Bakery", category: "Food", amount: 180, visits: 8, tier: "Patron", color: "#f97316" },
  { name: "Local Bookshop", category: "Retail", amount: 150, visits: 6, tier: "Patron", color: "#3b82f6" },
  { name: "Green Grocer", category: "Grocery", amount: 120, visits: 4, tier: "Regular", color: "#10b981" },
  { name: "New Cafe", category: "Coffee", amount: 45, visits: 2, tier: "First Timer", color: "#f59e0b" },
  { name: "Art Gallery", category: "Retail", amount: 80, visits: 1, tier: "First Timer", color: "#3b82f6" },
  { name: "Yoga Studio", category: "Retail", amount: 60, visits: 2, tier: "First Timer", color: "#3b82f6" },
  { name: "Bike Shop", category: "Retail", amount: 200, visits: 1, tier: "First Timer", color: "#3b82f6" },
]

// Prepare data for different chart types
const barChartData = merchantData
  .sort((a, b) => b.amount - a.amount)
  .map((m) => ({ name: m.name, amount: m.amount, color: m.color }))

const bubbleChartData = merchantData.map((m) => ({
  x: m.visits,
  y: m.category === "Coffee" ? 3 : m.category === "Grocery" ? 2 : m.category === "Food" ? 1 : 0,
  z: m.amount,
  name: m.name,
  color: m.color,
  category: m.category,
}))

const treemapData = [
  { name: "Coffee", value: 285, color: "#f59e0b" },
  { name: "Grocery", value: 820, color: "#10b981" },
  { name: "Food", value: 180, color: "#f97316" },
  { name: "Retail", value: 490, color: "#3b82f6" },
]

export default function GraphComparison() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Taste Graph Options</h1>
          <p className="mt-2 text-muted-foreground">
            Compare different visualization styles for your spending patterns
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Option 1: Bubble Chart */}
          <Card>
            <CardHeader>
              <CardTitle>1. Bubble Chart</CardTitle>
              <CardDescription>Size = amount spent, Position = category & visit frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Visits"
                    label={{ value: "Visit Frequency", position: "bottom", offset: 40 }}
                    domain={[0, 14]}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Category"
                    ticks={[0, 1, 2, 3]}
                    tickFormatter={(value) => {
                      const labels = ["Retail", "Food", "Grocery", "Coffee"]
                      return labels[value] || ""
                    }}
                    label={{ value: "Category", angle: -90, position: "left", offset: 40 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-muted-foreground">{data.category}</p>
                            <p className="text-sm">
                              ${data.z} • {data.x} visits
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter data={bubbleChartData}>
                    {bubbleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Option 2: Treemap (Simplified as stacked bars) */}
          <Card>
            <CardHeader>
              <CardTitle>2. Treemap Style</CardTitle>
              <CardDescription>Size = amount spent, Grouped by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid h-[400px] grid-cols-2 gap-2">
                {treemapData.map((category) => (
                  <div
                    key={category.name}
                    className="flex flex-col items-center justify-center rounded-lg p-4 text-white transition-transform hover:scale-105"
                    style={{
                      backgroundColor: category.color,
                      gridRow: category.value > 400 ? "span 2" : "span 1",
                    }}
                  >
                    <div className="text-center">
                      {category.name === "Coffee" && <Coffee className="mx-auto mb-2 h-8 w-8" />}
                      {category.name === "Grocery" && <ShoppingBag className="mx-auto mb-2 h-8 w-8" />}
                      {category.name === "Food" && <UtensilsCrossed className="mx-auto mb-2 h-8 w-8" />}
                      {category.name === "Retail" && <Store className="mx-auto mb-2 h-8 w-8" />}
                      <p className="text-lg font-semibold">{category.name}</p>
                      <p className="text-2xl font-bold">${category.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Option 3: Horizontal Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>3. Horizontal Bar Chart</CardTitle>
              <CardDescription>Length = amount spent, Sorted by spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={90} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-semibold">{payload[0].payload.name}</p>
                            <p className="text-sm">${payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Option 4: Radial/Circular Bars */}
          <Card>
            <CardHeader>
              <CardTitle>4. Radial Bar Chart</CardTitle>
              <CardDescription>Circular arrangement, Length = amount spent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-80 w-80">
                    {merchantData.slice(0, 8).map((merchant, index) => {
                      const angle = (index * 360) / 8
                      const radius = 120
                      const barLength = (merchant.amount / 400) * 80
                      const x = Math.cos((angle * Math.PI) / 180) * radius
                      const y = Math.sin((angle * Math.PI) / 180) * radius

                      return (
                        <div
                          key={merchant.name}
                          className="absolute left-1/2 top-1/2 origin-left"
                          style={{
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
                          }}
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: "8px",
                              height: `${barLength}px`,
                              backgroundColor: merchant.color,
                            }}
                          />
                        </div>
                      )
                    })}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">$1,755</p>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Recommendation: Bubble Chart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Pros</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Shows 3 dimensions: category, frequency, amount</li>
                  <li>• Clear visual hierarchy (bigger = more spending)</li>
                  <li>• Easy to identify patterns and outliers</li>
                  <li>• Interactive and engaging</li>
                  <li>• Tells a story about spending behavior</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Best For</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Understanding spending identity</li>
                  <li>• Comparing merchants across categories</li>
                  <li>• Seeing relationship tiers (First Timer → Patron)</li>
                  <li>• Quick visual scanning</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

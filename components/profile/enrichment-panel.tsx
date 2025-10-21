"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EnrichmentPanelProps {
  transaction: any
  onClose: () => void
}

const SUGGESTED_TAGS = [
  "local",
  "sustainable",
  "vintage",
  "minority-owned",
  "handmade",
  "eco",
  "resale",
  "indie",
  "gift",
]

export function EnrichmentPanel({ transaction, onClose }: EnrichmentPanelProps) {
  const { toast } = useToast()
  const enrichment = transaction.enrichment || {}

  const [visibility, setVisibility] = useState(enrichment.visibility || "private")
  const [productBrand, setProductBrand] = useState(enrichment.product_brand || "")
  const [productName, setProductName] = useState(enrichment.product_name || "")
  const [productUrl, setProductUrl] = useState(enrichment.product_url || "")
  const [productImageUrl, setProductImageUrl] = useState(enrichment.product_image_url || "")
  const [userNotes, setUserNotes] = useState(enrichment.user_notes || "")
  const [userTags, setUserTags] = useState<string[]>(enrichment.user_tags || [])

  const handleSave = () => {
    // Stub: would save to Supabase
    console.log("[v0] Saving enrichment:", {
      transaction_id: transaction.id,
      visibility,
      product_brand: productBrand,
      product_name: productName,
      product_url: productUrl,
      product_image_url: productImageUrl,
      user_notes: userNotes,
      user_tags: userTags,
    })

    toast({
      title: "Saved!",
      description: "Your changes have been saved.",
    })

    onClose()
  }

  const toggleTag = (tag: string) => {
    setUserTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-lg">
        <SheetHeader className="pt-6">
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>Add product details, context, and receipts to enrich this transaction.</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="visibility" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="visibility" className="mt-6 space-y-6">
            <div className="space-y-3">
              <Label>Who can see this?</Label>
              <div className="space-y-2">
                {["public", "friends", "private"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setVisibility(option)}
                    className={`w-full cursor-pointer rounded-lg border p-4 text-left transition-colors ${
                      visibility === option ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium capitalize">{option}</div>
                    <div className="text-sm text-muted-foreground">
                      {option === "public" && "Anyone can see this transaction"}
                      {option === "friends" && "Only your friends can see this"}
                      {option === "private" && "Only you can see this"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="product" className="mt-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-brand">Product Brand</Label>
                <Input
                  id="product-brand"
                  value={productBrand}
                  onChange={(e) => setProductBrand(e.target.value)}
                  placeholder="e.g., Nike"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Air Max 90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-url">Product URL</Label>
                <Input
                  id="product-url"
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-image">Product Image</Label>
                <div className="space-y-2">
                  <Input
                    id="product-image"
                    type="url"
                    value={productImageUrl}
                    onChange={(e) => setProductImageUrl(e.target.value)}
                    placeholder="Paste image URL"
                  />
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="mt-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-notes">Notes</Label>
                <Textarea
                  id="user-notes"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Add context about this purchase..."
                  rows={4}
                  maxLength={240}
                />
                <p className="text-xs text-muted-foreground">{userNotes.length}/240 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={userTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="mt-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Receipt</Label>
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, or PNG</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                <p className="font-medium">Coming soon:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Automatic receipt parsing</li>
                  <li>Line item extraction</li>
                  <li>Multi-item transaction support</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-3 pb-6">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

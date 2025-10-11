"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { formatCategoryName } from "@/lib/utils/format-category"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SettingsFormProps {
  userId: string
  hiddenCategories: string[]
  hiddenMerchants: string[]
  defaultDropVisibility: string
  availableCategories: string[]
  availableMerchants: string[]
}

export function SettingsForm({
  userId,
  hiddenCategories: initialHiddenCategories,
  hiddenMerchants: initialHiddenMerchants,
  defaultDropVisibility: initialVisibility,
  availableCategories,
  availableMerchants,
}: SettingsFormProps) {
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(initialHiddenCategories)
  const [hiddenMerchants, setHiddenMerchants] = useState<string[]>(initialHiddenMerchants)
  const [defaultDropVisibility, setDefaultDropVisibility] = useState(initialVisibility)
  const [categorySearch, setCategorySearch] = useState("")
  const [merchantSearch, setMerchantSearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const toggleCategory = (category: string) => {
    setHiddenCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  const toggleMerchant = (merchant: string) => {
    setHiddenMerchants((prev) => (prev.includes(merchant) ? prev.filter((m) => m !== merchant) : [...prev, merchant]))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          hidden_categories: hiddenCategories,
          hidden_merchants: hiddenMerchants,
          default_drop_visibility: defaultDropVisibility,
        })
        .eq("id", userId)

      if (error) {
        console.error("Error saving settings:", error)
        toast({
          title: "Error saving settings",
          description: error.message.includes("column")
            ? "Database migration required. Please run scripts/11-add-user-settings.sql"
            : error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCategories = availableCategories.filter((cat) =>
    formatCategoryName(cat).toLowerCase().includes(categorySearch.toLowerCase()),
  )

  const filteredMerchants = availableMerchants.filter((merchant) =>
    merchant.toLowerCase().includes(merchantSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Default Drop Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Default Drop Visibility</CardTitle>
          <CardDescription>Choose the default visibility when creating new drops</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={defaultDropVisibility} onValueChange={setDefaultDropVisibility}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="font-normal cursor-pointer">
                Public - Anyone can see your drops
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="font-normal cursor-pointer">
                Private - Only you can see your drops
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Hidden Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Hidden Transaction Categories</CardTitle>
          <CardDescription>
            Select categories to hide from your transactions list. Hidden categories won't appear in your feed or be
            available for sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer flex-1">
                  {formatCategoryName(category)}
                </Label>
                <Switch
                  id={`cat-${category}`}
                  checked={hiddenCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
              </div>
            ))}
          </div>

          {hiddenCategories.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {hiddenCategories.length} {hiddenCategories.length === 1 ? "category" : "categories"} hidden
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Merchants */}
      <Card>
        <CardHeader>
          <CardTitle>Hidden Merchants</CardTitle>
          <CardDescription>
            Select merchants to hide from your transactions list. Transactions from hidden merchants won't appear in
            your feed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={merchantSearch}
              onChange={(e) => setMerchantSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMerchants.map((merchant) => (
              <div key={merchant} className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor={`mer-${merchant}`} className="font-normal cursor-pointer flex-1">
                  {merchant}
                </Label>
                <Switch
                  id={`mer-${merchant}`}
                  checked={hiddenMerchants.includes(merchant)}
                  onCheckedChange={() => toggleMerchant(merchant)}
                />
              </div>
            ))}
          </div>

          {hiddenMerchants.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {hiddenMerchants.length} {hiddenMerchants.length === 1 ? "merchant" : "merchants"} hidden
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

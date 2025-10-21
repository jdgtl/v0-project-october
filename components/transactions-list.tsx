"use client"

import { useState } from "react"
import { TransactionCard } from "@/components/transaction-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Transaction } from "@/lib/types/database"

interface TransactionsListProps {
  transactions: Array<
    Transaction & {
      photos?: Array<{ id: string; photo_url: string; thumbnail_url?: string }>
    }
  >
  userId: string
}

export function TransactionsList({ transactions, userId }: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = Array.from(new Set(transactions.flatMap((t) => t.category || []).filter(Boolean))).sort()

  console.log("[v0] Available categories:", categories)
  console.log(
    "[v0] Sample transaction categories:",
    transactions.slice(0, 3).map((t) => ({
      merchant: t.merchant_name,
      category: t.category,
    })),
  )

  // Filter and sort transactions
  let filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchQuery ||
      transaction.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category?.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = filterCategory === "all" || transaction.category?.includes(filterCategory)

    return matchesSearch && matchesCategory
  })

  // Sort transactions
  filteredTransactions = filteredTransactions.sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "amount-desc":
        return b.amount - a.amount
      case "amount-asc":
        return a.amount - b.amount
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="amount-desc">Highest Amount</SelectItem>
            <SelectItem value="amount-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? "transaction" : "transactions"}
        </p>
      </div>

      {/* Transactions grid */}
      {filteredTransactions.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium">No transactions found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || filterCategory !== "all"
                ? "Try adjusting your filters"
                : "Connect a bank account to see your transactions"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} userId={userId} />
          ))}
        </div>
      )}
    </div>
  )
}

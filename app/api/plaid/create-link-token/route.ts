import { NextResponse } from "next/server"
import { getUser } from "@/lib/dev-auth"

export async function POST() {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create Plaid Link token
    const response = await fetch("https://sandbox.plaid.com/link/token/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        user: {
          client_user_id: user.id,
        },
        client_name: "Project October",
        products: ["transactions"],
        country_codes: ["US"],
        language: "en",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_message || "Failed to create link token")
    }

    return NextResponse.json({ link_token: data.link_token })
  } catch (error) {
    console.error("[v0] Error creating link token:", error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}

import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to sample profile
  redirect("/profile/jordan")
}

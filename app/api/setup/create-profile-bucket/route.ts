import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error("[v0] Error listing buckets:", listError)
      return Response.json({ error: "Failed to list buckets" }, { status: 500 })
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "profile-photos")

    if (!bucketExists) {
      const { data, error } = await supabaseAdmin.storage.createBucket("profile-photos", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      })

      if (error) {
        console.error("[v0] Error creating bucket:", error)
        return Response.json({ error: error.message }, { status: 500 })
      }

      console.log("[v0] Profile photos bucket created successfully")
      return Response.json({ message: "Bucket created successfully", data })
    }

    return Response.json({ message: "Bucket already exists" })
  } catch (error) {
    console.error("[v0] Error in create-profile-bucket:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

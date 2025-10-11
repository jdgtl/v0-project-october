import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10ctober-RlLk5JDM4c1wuQlc7iN43byZzlfmlA.png"
            alt="Project October"
            width={400}
            height={200}
            className="h-auto w-96"
            priority
          />
        </div>
        <div className="flex flex-row justify-center gap-2">
          <Link
            href="/auth/signup"
            className="inline-flex h-11 w-32 items-center justify-center rounded-md text-sm font-bold transition-all hover:border hover:border-input hover:bg-background"
          >
            SIGN UP
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-11 w-32 items-center justify-center rounded-md text-sm font-bold transition-all hover:border hover:border-input hover:bg-background"
          >
            LOG IN
          </Link>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a verification link to confirm your email address</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Click the link in the email to verify your account and complete your profile setup.</p>
            <p className="mt-4">Didn&apos;t receive the email? Check your spam folder.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { type FormEvent, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogIn, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"


const featureHighlights = ["Daily prompts", "Mood tracking", "Cloud Sync"]

export const AuthPage = () => {
  const { user, isLoading, signIn, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const primaryEmail = useMemo(() => {
    if (!user) return undefined
    return user.email ?? user.attributes.email ?? user.username
  }, [user])

  const handleContinue = () => {
    const redirectTo = (location.state as { returnTo?: string } | null)?.returnTo ?? "/"
    navigate(redirectTo, { replace: true })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) {
      setFormError("Email and password are required")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await signIn(email.trim(), password)
      handleContinue()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "NEW_PASSWORD_REQUIRED") {
          setFormError("Your account requires a new password. Please reset your password and try again.")
        } else {
          setFormError(error.message || "Unable to sign in. Check your credentials and try again.")
        }
      } else {
        setFormError("Unable to sign in. Check your credentials and try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
            Gentle focus, daily clarity
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Journal with intention
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              SkyNotes keeps your reflections organised and accessible. Start each day with a short prompt, capture wins in seconds, and notice the patterns that shape your story.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card key={feature} className="border-border/60 bg-secondary/20 shadow-sm">
                <CardContent className="p-4 text-sm font-medium text-foreground/80">{feature}</CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Card className="border-border/70 shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground/90">{user ? "You are signed in" : "Sign in to continue"}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {user
                  ? "Welcome back. You can continue to your journal or sign out below."
                  : "Use your Cognito credentials to access SkyNotes."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/40 px-4 py-8 text-sm text-muted-foreground">
                  Checking your session…
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                    Signed in as <span className="font-medium text-foreground">{primaryEmail ?? "SkyNotes member"}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button className="h-10 gap-2 text-sm" onClick={handleContinue}>
                      Continue to app
                    </Button>
                    <Button variant="outline" className="h-10 gap-2 text-sm" onClick={() => { void signOut(); }}> 
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="email">
                      Email or username
                    </label>
                    <Input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@skynotes.app"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="password">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  {formError ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {formError}
                    </div>
                  ) : null}
                  <div className="space-y-3">
                    <Button type="submit" className="h-10 w-full gap-2 text-sm" disabled={isSubmitting}>
                      <LogIn className="size-4" />
                      {isSubmitting ? "Signing in…" : "Sign in"}
                    </Button>
                    <Separator className="bg-border/60" />
                    <p className="text-xs text-muted-foreground">
                      Forgot your password? Use the Cognito hosted recovery page linked in your invitation email or contact support.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      New to SkyNotes? <Link className="text-foreground underline" to="/signup" state={{ returnTo: (location.state as { returnTo?: string } | null)?.returnTo }}>Create an account</Link>.
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
              Need help? Contact support@skynotes.app for assistance with your account.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  

  )
}



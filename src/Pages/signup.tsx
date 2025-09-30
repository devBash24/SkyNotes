import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, MailCheck, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"

const featureHighlights = ["Guided setup", "Secure verification", "Quick sign-in"]

type Stage = "form" | "verify"

type PendingAccount = {
  email: string
  password: string
}

export const SignUpPage = () => {
  const { user, isLoading, signUp, confirmSignUp, resendConfirmationCode, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [stage, setStage] = useState<Stage>("form")
  const [pendingAccount, setPendingAccount] = useState<PendingAccount | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const returnTo = useMemo(() => {
    const state = location.state as { returnTo?: string } | null
    return state?.returnTo ?? "/"
  }, [location.state])

  useEffect(() => {
    if (!isLoading && user) {
      navigate(returnTo, { replace: true })
    }
  }, [isLoading, user, navigate, returnTo])

  const resetMessages = () => {
    setFeedback(null)
    setErrorMessage(null)
  }

  const handleSignUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      await signUp({ email: email.trim(), password })
      setPendingAccount({  email: email.trim(), password })
      setStage("verify")
      setFeedback(`We sent a verification code to ${email.trim()}. Enter it below to activate your account.`)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || "Unable to sign up. Please try again.")
      } else {
        setErrorMessage("Unable to sign up. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    if (!pendingAccount) {
      setErrorMessage("We could not find your sign up details. Please start again.")
      setStage("form")
      return
    }

    if (!verificationCode.trim()) {
      setErrorMessage("Please enter the verification code sent to your email")
      return
    }

    setIsSubmitting(true)
    try {
      await confirmSignUp(pendingAccount.email, verificationCode.trim())
      setFeedback("Your account has been verified. Signing you in…")
      await signIn(pendingAccount.email, pendingAccount.password)
      navigate(returnTo, { replace: true })
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || "Verification failed. Please try again.")
      } else {
        setErrorMessage("Verification failed. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    resetMessages()
    if (!pendingAccount) {
      setErrorMessage("No pending account found. Please sign up again.")
      setStage("form")
      return
    }

    setIsSubmitting(true)
    try {
      await resendConfirmationCode(pendingAccount.email)
      setFeedback(`A new verification code has been sent to ${pendingAccount.email}.`)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || "Could not resend the code. Please try again later.")
      } else {
        setErrorMessage("Could not resend the code. Please try again later.")
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
            Create your flow
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Set up your SkyNotes account
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              Securely capture your reflections with just a few details. We&apos;ll confirm your email before you dive in.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card key={feature} className="border-border/60 bg-secondary/20 shadow-sm">
                <CardContent className="flex items-center gap-2 p-4 text-sm font-medium text-foreground/80">
                  <CheckCircle2 className="size-4 text-primary" />
                  {feature}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <Card className="border-border/70 shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground/90">
                {stage === "form" ? "Create your account" : "Verify your email"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {stage === "form"
                  ? "Choose a username, add your email, and set a secure password to get started."
                  : "Enter the verification code we sent to your email address to finish setting up your account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stage === "form" ? (
                <form className="space-y-4" onSubmit={handleSignUpSubmit}>
                  {/* <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="username">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="your-username"
                      autoComplete="username"
                      required
                    />
                  </div> */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@skynotes.app"
                      autoComplete="email"
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
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="confirm-password">
                      Confirm password
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="********"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {errorMessage ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {errorMessage}
                    </div>
                  ) : null}
                  {feedback ? (
                    <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
                      {feedback}
                    </div>
                  ) : null}
                  <Button type="submit" className="h-10 w-full gap-2 text-sm" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account…" : "Create account"}
                  </Button>
                  <Separator className="bg-border/60" />
                  <p className="text-xs text-muted-foreground">
                    Already have an account? {" "}
                    <Link className="text-foreground underline" to="/auth" state={{ returnTo }}>
                      Sign in instead
                    </Link>
                  </p>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleVerificationSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="verification">
                      Verification code
                    </label>
                    <Input
                      id="verification"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      placeholder="Enter the 6-digit code"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                  {errorMessage ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {errorMessage}
                    </div>
                  ) : null}
                  {feedback ? (
                    <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
                      {feedback}
                    </div>
                  ) : null}
                  <Button type="submit" className="h-10 w-full gap-2 text-sm" disabled={isSubmitting}>
                    {isSubmitting ? "Verifying…" : "Verify and continue"}
                  </Button>
                  <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-left text-foreground underline"
                      onClick={handleResendCode}
                      disabled={isSubmitting}
                    >
                      <RefreshCw className="size-3.5" />
                      Resend code
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-left text-foreground underline"
                      onClick={() => {
                        setStage("form")
                        setVerificationCode("")
                        setFeedback(null)
                        setErrorMessage(null)
                      }}
                    >
                      <MailCheck className="size-3.5" />
                      Change email or start over
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/60 bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
              By signing up you agree to receive occasional product updates. You can unsubscribe any time.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

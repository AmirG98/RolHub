import { SignUp } from '@clerk/nextjs'
import { clerkConfig } from '@/lib/clerk-config'

export default function RegisterPage() {
  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <SignUp
          appearance={clerkConfig.appearance}
          signInUrl={clerkConfig.signInUrl}
          fallbackRedirectUrl={clerkConfig.afterSignUpUrl}
          path="/register"
          routing="path"
        />
      </div>
    </div>
  )
}

import { SignIn } from '@clerk/nextjs'
import { clerkConfig } from '@/lib/clerk-config'

export default function LoginPage() {
  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <SignIn
          appearance={clerkConfig.appearance}
          signUpUrl={clerkConfig.signUpUrl}
          afterSignInUrl={clerkConfig.afterSignInUrl}
          routing="path"
        />
      </div>
    </div>
  )
}

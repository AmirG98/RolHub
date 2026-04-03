import { SignIn } from '@clerk/nextjs'
import { clerkConfig } from '@/lib/clerk-config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <SignIn
          appearance={clerkConfig.appearance}
          signUpUrl={clerkConfig.signUpUrl}
          fallbackRedirectUrl={clerkConfig.afterSignInUrl}
          path="/login"
          routing="path"
        />
      </div>
    </div>
  )
}

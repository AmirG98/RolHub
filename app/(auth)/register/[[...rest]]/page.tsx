import { SignUp } from '@clerk/nextjs'
import { clerkConfig } from '@/lib/clerk-config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

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

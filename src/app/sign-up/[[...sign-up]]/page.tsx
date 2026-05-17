import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main style={{ background: '#0F100A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SignUp fallbackRedirectUrl="/dashboard" />
    </main>
  )
}

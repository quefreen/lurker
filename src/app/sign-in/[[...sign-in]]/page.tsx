import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main style={{ background: '#0F100A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SignIn fallbackRedirectUrl="/" />
    </main>
  )
}

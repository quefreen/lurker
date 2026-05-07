import Link from 'next/link';
import Image from 'next/image';
import { NavAuth } from '@/components/NavAuth';

export default function LandingMenu() {
  return (
    <nav
      className="w-full flex items-center px-6 lg:px-[150px]"
      style={{ background: '#05060f', height: '80px', borderBottom: '1px solid #1a1a1a' }}
    >
      <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src="/lurker.svg" alt="lurker" width={120} height={36} priority />
        </Link>

        {/* CTA / User menu */}
        <NavAuth />
      </div>
    </nav>
  );
}

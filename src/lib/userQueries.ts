import { db } from './db'

export interface UserRecord {
  id: number
  clerk_id: string
  email: string
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  created_at: string
}

export async function getUserByClerkId(clerkId: string): Promise<UserRecord | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE clerk_id = ?',
      args: [clerkId],
    })
    return result.rows.length > 0 ? (result.rows[0] as unknown as UserRecord) : null
  } catch {
    return null
  }
}

export async function upsertUser(clerkId: string, email: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO users (clerk_id, email)
          VALUES (?, ?)
          ON CONFLICT(clerk_id) DO UPDATE SET
            email = excluded.email,
            updated_at = datetime('now')`,
    args: [clerkId, email],
  })
}

export async function updateUserPlan(
  clerkId: string,
  plan: 'free' | 'pro',
  stripeCustomerId?: string
): Promise<void> {
  await db.execute({
    sql: `UPDATE users SET
            plan = ?,
            stripe_customer_id = COALESCE(?, stripe_customer_id),
            updated_at = datetime('now')
          WHERE clerk_id = ?`,
    args: [plan, stripeCustomerId ?? null, clerkId],
  })
}

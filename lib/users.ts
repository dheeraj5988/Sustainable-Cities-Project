// Predefined users for authentication
export const USERS = {
  "user@gmail.com": { password: "user@123", role: "user" as const },
  "admin@gmail.com": { password: "admin@123", role: "admin" as const },
  "worker@gmail.com": { password: "worker@123", role: "worker" as const },
}

export type UserRole = "user" | "admin" | "worker"

export interface User {
  email: string
  role: UserRole
  password: string
}

export function validateUser(email: string, password: string): { valid: boolean; user?: Omit<User, "password"> } {
  const lowercaseEmail = email.toLowerCase()
  const userRecord = USERS[lowercaseEmail as keyof typeof USERS]

  if (!userRecord) {
    return { valid: false }
  }

  if (userRecord.password !== password) {
    return { valid: false }
  }

  return {
    valid: true,
    user: {
      email: lowercaseEmail,
      role: userRecord.role,
    },
  }
}

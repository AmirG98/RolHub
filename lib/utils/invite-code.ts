// Generate a random invite code (6 uppercase alphanumeric characters)
export function generateInviteCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like 0,O,1,I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

// Get invite URL from code
export function getInviteUrl(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/invite/${code}`
}

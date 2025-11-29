// Admin authentication - проверка адреса кошелька админа
import { isValidEvmAddress } from "@/lib/anti-abuse/validators"

// Whitelist админов (в production хранить в .env или БД)
const ADMIN_ADDRESSES = (process.env.ADMIN_WALLET_ADDRESSES || "")
  .split(",")
  .map((addr) => addr.toLowerCase().trim())
  .filter(Boolean)

/**
 * Check if wallet address is admin
 */
export function isAdmin(walletAddress: string): boolean {
  if (!walletAddress || !isValidEvmAddress(walletAddress)) {
    return false
  }

  const normalized = walletAddress.toLowerCase()
  return ADMIN_ADDRESSES.includes(normalized)
}

/**
 * Verify admin signature (for future use)
 */
export async function verifyAdminSignature(
  address: string,
  signature: string,
  message: string,
): Promise<boolean> {
  // TODO: Implement signature verification
  // For now, just check if address is in whitelist
  return isAdmin(address)
}



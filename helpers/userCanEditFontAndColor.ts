import { useUser } from "../hooks";

/**
 * Determine if the user can edit font collection and color palette
 */
export function userCanEditFontAndColor(user: ReturnType<typeof useUser>) {
  return user && (user.role === "flapjack" || user.subscriptionActive);
}

export const UPTIONS_FLOW_COOKIE = "uptions_checkout_flow_id"

export const flowCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 4,
  secure: process.env.NODE_ENV === "production",
}

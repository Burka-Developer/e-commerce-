import { NextRequest, NextResponse } from "next/server"

/**
 * OAuth 2.0 callback handler for Google sign-in popup.
 * This endpoint receives the authorization code and exchanges it for an ID token.
 * Route: /api/auth/callback/google (matches Google Console redirect URI)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check for errors from Google
    if (error) {
      return new NextResponse(
        `<script>window.opener.postMessage({ type: 'google_auth_error', error: '${error}' }, '*'); window.close();</script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    if (!code) {
      return new NextResponse(
        `<script>window.opener.postMessage({ type: 'google_auth_error', error: 'No authorization code' }, '*'); window.close();</script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    // Verify state matches (basic CSRF check)
    const storedState = req.cookies.get("google_oauth_state")?.value
    if (!state || state !== storedState) {
      return new NextResponse(
        `<script>window.opener.postMessage({ type: 'google_auth_error', error: 'State mismatch' }, '*'); window.close();</script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    // Exchange code for token (server-side)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  // Build redirect URI from the request origin to ensure it matches the initial authorization request
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      return new NextResponse(
        `<script>window.opener.postMessage({ type: 'google_auth_error', error: 'Server not configured' }, '*'); window.close();</script>`,
        {
          status: 500,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.id_token) {
      return new NextResponse(
        `<script>window.opener.postMessage({ type: 'google_auth_error', error: 'No ID token received' }, '*'); window.close();</script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    // Send ID token back to parent window
    const targetOrigin = req.nextUrl.origin.replace(/'/g, "\\'")
    const idTokenEscaped = String(tokenData.id_token).replace(/'/g, "\\'")
    return new NextResponse(
      `<script>
        (function(){
          try {
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'google_auth_success', 
                id_token: '${idTokenEscaped}' 
              }, '${targetOrigin}');
            }
          } finally { window.close(); }
        })();
      </script>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    )
  } catch (error) {
    console.error("Google callback error:", error)
    return new NextResponse(
      `<script>window.opener.postMessage({ type: 'google_auth_error', error: 'Authentication failed' }, '*'); window.close();</script>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    )
  }
}

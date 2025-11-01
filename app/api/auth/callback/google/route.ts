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
    const error = searchParams.get("error")

    // Check for errors from Google
    if (error) {
      return new NextResponse(
        `<script>
          if (window.opener) {
            window.opener.postMessage({ type: 'google_auth_error', error: '${error}' }, '*');
            window.close();
          }
        </script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    if (!code) {
      return new NextResponse(
        `<script>
          if (window.opener) {
            window.opener.postMessage({ type: 'google_auth_error', error: 'No authorization code' }, '*');
            window.close();
          }
        </script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    // Exchange code for token (server-side)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  // Build redirect URI from the actual request origin to exactly match the one used in the auth request
  const redirectUri = `${req.nextUrl.origin}/api/auth/callback/google`

    if (!clientId || !clientSecret) {
      return new NextResponse(
        `<script>
          if (window.opener) {
            window.opener.postMessage({ type: 'google_auth_error', error: 'Server not configured' }, '*');
            window.close();
          }
        </script>`,
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
      console.error("No ID token in response:", tokenData)
      return new NextResponse(
        `<script>
          if (window.opener) {
            window.opener.postMessage({ type: 'google_auth_error', error: 'No ID token received' }, '*');
            window.close();
          }
        </script>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    // Send ID token back to parent window via postMessage
    // The parent window will handle the /api/auth/google exchange
    return new NextResponse(
      `<script>
        if (window.opener) {
          try {
            window.opener.postMessage({ 
              type: 'google_auth_success', 
              id_token: '${tokenData.id_token}' 
            }, window.location.origin);
            console.log('postMessage sent successfully to parent');
            setTimeout(() => window.close(), 500);
          } catch (e) {
            console.error('postMessage failed:', e);
            window.opener.postMessage({ 
              type: 'google_auth_success', 
              id_token: '${tokenData.id_token}' 
            }, '*');
            setTimeout(() => window.close(), 500);
          }
        } else {
          console.log('No window.opener, using fallback redirect');
          window.location.href = '/auth?google_token=${encodeURIComponent(tokenData.id_token)}';
        }
      </script>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    )
  } catch (error) {
    console.error("Google callback error:", error)
    return new NextResponse(
      `<script>
        if (window.opener) {
          window.opener.postMessage({ type: 'google_auth_error', error: 'Authentication failed' }, '*');
          window.close();
        }
      </script>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    )
  }
}

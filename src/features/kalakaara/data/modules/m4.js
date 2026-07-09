// Module 4 — Authentication with Google
// KalaKaara (React + Supabase) course content for the React course player.

export const m4 = {
  id: 'm4',
  title: 'Authentication with Google',
  hours: 6,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Wire Google sign-in end to end: the OAuth 2.0 + PKCE round trip, a Google OAuth client that costs nothing and never asks for a card, session handling in React with a single SessionContext, protected routes for /dashboard and /favourites, sign-out, and the profiles-row trigger that means your React code never has to create a profile by hand. This is where the anonymous-by-default product finally grows a login — for exactly the five actions that need one.',
  sections: [
    {
      id: 'm4-s1',
      title: 'OAuth, and a Google client that costs nothing',
      topics: [
        {
          id: 'm4-t1',
          title: 'What OAuth 2.0 and OIDC actually do',
          explain:
            'OAuth lets a user prove who they are to KalaKaara using their Google account, without KalaKaara ever seeing their Google password.',
          analogy:
            'Think of the seva counter at Kollur temple. To collect a booked seva you do not hand the archaka your bank PIN — you show a token slip the office already issued in your name. The archaka trusts the office, checks the slip, and serves you. Google is the office, the slip is the authorization code, and KalaKaara is the archaka who never needs to know your PIN.',
          theory:
            '**OAuth 2.0** is an authorization framework: it lets one application act on a resource on behalf of a user, using a short-lived token instead of the user\'s password. **OpenID Connect (OIDC)** is a thin layer on top of OAuth that adds *identity* — an `id_token` (a signed JWT) that says "this is who the user is: email, name, a stable subject id." "Sign in with Google" is OIDC riding on OAuth.\n\nThe specific dance we use is the **Authorization Code flow with PKCE** (Proof Key for Code Exchange, pronounced "pixy"). Walk it slowly:\n\n1. Before redirecting, the client generates a random secret — the **code verifier** — and hashes it into a **code challenge**. The verifier stays in the browser; only the hash goes to Google.\n2. The browser is redirected to Google\'s consent page, carrying the code challenge and the scopes requested (email, profile).\n3. The user logs into Google and consents. **KalaKaara never sees this** — the password is typed on `accounts.google.com`, not on our page.\n4. Google redirects back with a short-lived **authorization code**. A code is not a session; it is a one-time voucher.\n5. The code is exchanged for tokens — and this is where PKCE earns its place: the exchange must present the original **code verifier**. Google hashes it and checks it matches the challenge from step 1. An attacker who intercepted the code cannot use it, because they never had the verifier.\n6. In our stack the exchange happens against Supabase, which validates with Google, then mints **its own JWT** for the KalaKaara session. From here on, every request to Postgres carries that Supabase JWT, and `auth.uid()` reads the user id out of it.\n\nWhy is this safer than a password field of your own? Because a password you collect is a password you must store, hash, salt, rotate, and defend against a breach for the rest of the app\'s life. The most secure password database is the one you never built. Google already runs one, with hardware keys and anomaly detection you cannot match, so we borrow their identity and store none of our own.',
          diagram: `sequenceDiagram
    autonumber
    actor U as User
    participant R as KalaKaara (React)
    participant G as Google (OIDC)
    participant S as Supabase (GoTrue)

    R->>R: generate code_verifier + code_challenge (PKCE)
    R->>G: redirect to consent (challenge + scopes: email, profile)
    U->>G: log in and consent (password typed on Google, not on us)
    G-->>R: redirect back with one-time authorization code
    R->>S: exchange code + code_verifier
    S->>G: validate code, fetch id_token (who the user is)
    G-->>S: id_token + tokens
    S-->>R: Supabase session JWT
    Note over R,S: every later query carries this JWT; auth.uid() reads it`,
          flowExplain:
            'Step 1 and the verifier in step 5 are the whole security argument: the code alone is useless without the verifier that never left the browser. Note that our password is never in this diagram, because we never have one.',
          whyItMatters:
            'Interviewers ask "what stops someone who steals the authorization code from logging in as the user?" The answer is PKCE: the verifier never travelled, so the stolen code cannot be redeemed. Being able to say that — and to explain why storing password hashes is a liability you chose to avoid — separates a candidate who used OAuth from one who understands it.',
          steps: [
            'Say the four nouns out loud until they are distinct: code verifier (secret, stays home), code challenge (its hash, sent out), authorization code (one-time voucher from Google), session JWT (minted by Supabase).',
            'Trace who holds the password at each step. Answer: only Google, ever. KalaKaara never receives it.',
            'Note where the KalaKaara session actually begins: not when Google says yes, but when Supabase mints its own JWT after the exchange.',
            'Convince yourself why a stolen authorization code is worthless without the verifier — that is the single sentence PKCE exists to make true.',
            'Write down the liability you avoided: no password column, no hashing, no salt, no breach surface. That is a feature, not a gap.',
          ],
          code: `The Authorization Code + PKCE flow, in plain terms

  1. React makes a secret:
       code_verifier  = random 43-128 char string   (STAYS in the browser)
       code_challenge = base64url(sha256(code_verifier))   (SENT to Google)

  2. Browser -> Google:
       GET https://accounts.google.com/o/oauth2/v2/auth
         ?client_id=...&redirect_uri=<supabase callback>
         &response_type=code
         &scope=openid email profile
         &code_challenge=<challenge>&code_challenge_method=S256

  3. User logs in ON GOOGLE and consents. We never see the password.

  4. Google -> browser:
       302 to <redirect_uri>?code=<one-time authorization code>

  5. Exchange (supabase-js does this for you):
       POST token endpoint  { code, code_verifier }
       Google re-hashes the verifier, checks it equals the challenge.
       Mismatch or missing verifier -> exchange REJECTED.

  6. Supabase mints its OWN JWT for the session and hands it to React.
     Every later PostgREST request sends it; Postgres reads auth.uid() from it.

  We store zero passwords. The most secure password store is the one
  you never built.`,
          pitfalls: [
            '**Thinking the authorization code is the session.** It is a one-time voucher, valid for seconds, and useless once exchanged. Fix: the session is the Supabase JWT that comes out of the exchange — that is the thing that lasts.',
            '**Believing you must build a password reset, hashing, and salting to "do auth properly".** With Google OIDC you build none of it. Fix: delegate identity to Google; the password you never store cannot be leaked.',
            '**Confusing authentication with authorization.** OAuth/OIDC tells you *who* the user is; RLS (Module 3) decides *what* they may do. Fix: keep them separate — a logged-in user is still stopped by a policy from editing someone else\'s artist row.',
            '**Assuming PKCE is optional because "we have a client secret."** A React SPA cannot keep a secret — it ships in the bundle. PKCE is what replaces the secret for public clients. Fix: never rely on a secret being hidden in frontend code; supabase-js uses PKCE by default, leave it on.',
          ],
          tryIt:
            'Explain to a friend, in three sentences, why an attacker who sniffs the redirect and grabs the `code` still cannot log in as the user. If your explanation does not use the word "verifier", read the theory again — the verifier that never left the browser is the entire answer.',
          takeaway:
            'OAuth + OIDC borrow Google\'s identity so you store no passwords; PKCE makes a stolen authorization code useless; the KalaKaara session begins when Supabase mints its own JWT.',
        },
        {
          id: 'm4-t2',
          title: 'Create the Google OAuth client — free, no credit card',
          explain:
            'You create OAuth credentials in Google Cloud Console; unlike Google Maps Platform, this needs a Google account, not a billing account, so no card is ever requested.',
          analogy:
            'The same government office issues both a free library card and a paid vehicle permit. Walking in does not commit you to the permit counter. Google Cloud Console is that office: the OAuth client is the free library card, and Maps Platform is the permit that wants your bank details. Same building, different counters, different rules.',
          theory:
            'This is the topic where NFR N1 (zero cost, no card) is easiest to trip over, because OAuth credentials and Maps Platform live in the *same* Google Cloud Console and beginners assume "Google Cloud means a card." It does not. Creating an OAuth 2.0 client asks only for a Google account. Maps Platform asks for an enabled **billing account**, which requires a card on file even inside the free quota. We create the former and never touch the latter.\n\nThe work has two parts. First the **OAuth consent screen**: this is the page users see when they sign in ("KalaKaara wants to access your name and email"). You choose the **External** user type, give the app a name and a support email, and — critically — request the *minimum* scopes. For KalaKaara that is exactly `email` and `profile` (plus `openid`, which is implied). Nothing more. You do not need Gmail, Drive, Calendar, or Contacts, so you never ask for them. An app that requests only email and profile stays in the "non-sensitive scopes" lane and does not trigger Google\'s verification review.\n\nWhile in testing mode, add your own Google address under **Test users** so you can sign in before the app is published. For a learning project you can leave it in testing indefinitely; publishing is only needed when strangers must sign in.\n\nSecond, the **OAuth client** itself, of type **Web application**. Two fields matter enormously and both are exact-match:\n\n- **Authorized JavaScript origins** — the origins your app is served from, no path: `http://localhost:5173` for local Vite, and later your Vercel URL.\n- **Authorized redirect URIs** — where Google is allowed to send the code back. In the Supabase model this is **not** your app; it is Supabase\'s callback: `https://<your-project-ref>.supabase.co/auth/v1/callback`. Google redirects to Supabase, Supabase does the token exchange, then Supabase redirects to your app.\n\nGet the redirect URI wrong by a single character — a trailing slash, `http` vs `https`, the wrong project ref — and Google refuses with `redirect_uri_mismatch`. That error is the subject of the next topic, and you will meet it at least once; everyone does.',
          whyItMatters:
            'The brief demands Google sign-in *and* no credit card. Knowing that OAuth credentials and Maps Platform are billed differently — despite sharing a console — is exactly the distinction that keeps the project completable by its own audience. Requesting minimal scopes is also a real security and trust practice: an app that asks for your entire Gmail to let you log in is an app you close.',
          steps: [
            'Create or select a Google Cloud project. No billing account is needed and none should be enabled.',
            'Configure the OAuth consent screen: External type, app name "KalaKaara", your support email, and add ONLY the `email` and `profile` scopes.',
            'Add your own Google address as a Test user so you can sign in while the app is unpublished.',
            'Create an OAuth client ID of type Web application.',
            'Under Authorized JavaScript origins add `http://localhost:5173` (and your Vercel URL later). Under Authorized redirect URIs add exactly `https://<project-ref>.supabase.co/auth/v1/callback`.',
            'Copy the Client ID and Client secret somewhere safe — the next topic pastes them into Supabase.',
          ],
          code: `Google Cloud Console — the exact values for KalaKaara

CONSENT SCREEN
  User type ............ External
  App name ............. KalaKaara
  Support email ........ you@gmail.com
  Scopes ............... openid, email, profile      <- nothing else
  Test users ........... you@gmail.com  (while unpublished)

OAUTH CLIENT
  Application type ..... Web application
  Name ................. KalaKaara web client

  Authorized JavaScript origins (origin only, NO path, NO trailing slash):
    http://localhost:5173
    https://kalakaara.vercel.app          (add after you deploy in M15)

  Authorized redirect URIs (this is SUPABASE, not your app):
    https://abcdefghijklmnop.supabase.co/auth/v1/callback
    ^ your real project ref from the Supabase dashboard URL

RESULT
  Client ID     123-abc.apps.googleusercontent.com
  Client secret GOCSPX-xxxxxxxxxxxxxxxx        -> paste both into Supabase

THE CARD TEST: at no point did any screen ask for a credit card.
Compare: enabling Maps Platform stops you dead at a billing account.`,
          pitfalls: [
            '**Enabling a billing account "to be safe".** You do not need one for OAuth, and enabling it puts a card on file — the exact thing NFR N1 forbids. Fix: create only the OAuth client; never enter the Maps Platform / billing flow.',
            '**Requesting broad scopes like Gmail or Drive.** It triggers Google\'s sensitive-scope verification and frightens users. Fix: request `email` and `profile` only. Sign-in needs nothing else.',
            '**Putting your app URL in the redirect URI field.** In the Supabase model the redirect target is Supabase\'s callback, not your React app. Fix: the redirect URI is always `https://<ref>.supabase.co/auth/v1/callback`; your app URL goes in Supabase\'s own Site URL / redirect list.',
            '**Adding a trailing slash or the wrong scheme to an origin.** `http://localhost:5173/` and `https://localhost:5173` both fail to match. Fix: origins are scheme + host + port, no path, no trailing slash, and localhost is `http` not `https`.',
            '**Leaving the client in Testing but forgetting to add yourself as a test user.** Then your own sign-in is refused with an access-blocked error. Fix: add your Google address under Test users before you try to log in.',
          ],
          tryIt:
            'Open the Maps Platform "Get Started" flow in Google Cloud Console and go as far as you can without entering a card. Note where it stops you. Then create the OAuth client and note that nothing asked for one. That contrast is the whole reason this course does location without Google Places.',
          takeaway:
            'OAuth credentials are free and card-free; Maps Platform is not, though they share a console. Request only email and profile, and point the redirect URI at Supabase, not at your app.',
        },
        {
          id: 'm4-t3',
          title: 'Wire the provider in Supabase, and read redirect_uri_mismatch',
          explain:
            'You paste the Google Client ID and secret into Supabase, set the Site URL and allowed redirect URLs, and learn to diagnose the one error everyone hits.',
          analogy:
            'Booking a bus ticket, the name on your ID, the name on the ticket, and the name the conductor reads must all match exactly. One spelling difference and you are off the bus. OAuth redirect URLs are that strict: Google, Supabase, and your app must all agree on the destination to the character.',
          theory:
            'With the Google client created, Supabase needs three things configured under **Authentication → Providers → Google** and **Authentication → URL Configuration**.\n\n**1. Enable Google and paste the credentials.** Toggle the Google provider on and paste the **Client ID** and **Client secret** from the previous topic. Supabase now knows how to complete the token exchange with Google on your behalf. This is why the redirect URI in Google pointed at Supabase: Supabase is the party that holds the secret and does the exchange, so your public React bundle never has to.\n\n**2. Set the Site URL.** This is the canonical origin of your app — `http://localhost:5173` during development, later swapped to your Vercel URL in production. Supabase uses it as the default place to send users after auth when no explicit `redirectTo` is given.\n\n**3. Set Additional Redirect URLs.** This is an allow-list of URLs that `signInWithOAuth({ options: { redirectTo } })` is permitted to send users back to. Add **both** `http://localhost:5173/auth/callback` and the future `https://kalakaara.vercel.app/auth/callback`. If you pass a `redirectTo` that is not on this list, Supabase silently drops it and falls back to the Site URL — a maddening bug where sign-in "works" but always dumps you on the home page.\n\nNow the error you will meet: **`redirect_uri_mismatch`**, shown by *Google*, not Supabase. It means the redirect URI Supabase sent to Google does not exactly equal any Authorized redirect URI registered on the Google client. Read it literally. Google\'s error page prints the exact URI it received — compare it, character by character, against what you registered. The usual culprits: a wrong or old project ref, `http` where `https` belongs, a trailing slash, or you edited the Google client but the change has not propagated yet (it can take a few minutes). Fix the mismatch at the source — the Google Authorized redirect URIs list must contain `https://<ref>.supabase.co/auth/v1/callback`, exactly.\n\nDistinguish this from a *different* failure: sign-in completes but you land on the wrong page. That is the Supabase Additional Redirect URLs list, not Google. Two lists, two different symptoms — knowing which is which saves you an hour.',
          diagram: `graph TD
    subgraph google[Google OAuth client]
      GR[Authorized redirect URIs:<br/>https://ref.supabase.co/auth/v1/callback]
    end
    subgraph supa[Supabase Auth settings]
      P[Provider Google: Client ID + secret]
      SU[Site URL: http://localhost:5173]
      AR[Additional Redirect URLs:<br/>localhost:5173/auth/callback<br/>+ vercel.app/auth/callback]
    end
    APP[Your React app] --> P
    P -- must exactly match --> GR
    APP -- redirectTo must be in --> AR
    GR -. mismatch here .-> E1[Google error:<br/>redirect_uri_mismatch]
    AR -. not listed .-> E2[Silent: lands on Site URL<br/>instead of where you asked]
    style E1 fill:#fecaca
    style E2 fill:#fde68a`,
          flowExplain:
            'Two independent match-checks, two different failures. A `redirect_uri_mismatch` is Google rejecting the Supabase callback (top). Landing on the wrong page silently is Supabase rejecting your redirectTo (bottom). Fix the right list.',
          whyItMatters:
            'Every developer who has ever wired OAuth has stared at `redirect_uri_mismatch`. The ones who fix it in two minutes are the ones who know it is an exact-string comparison and know which of the two lists to edit. This is practical, high-frequency debugging knowledge that no amount of theory substitutes for.',
          steps: [
            'In Supabase, Authentication → Providers → Google: enable it and paste the Client ID and Client secret.',
            'Set the Site URL to `http://localhost:5173` for now.',
            'Add both `http://localhost:5173/auth/callback` and your future Vercel `/auth/callback` to Additional Redirect URLs.',
            'Trigger a sign-in. If Google shows `redirect_uri_mismatch`, copy the exact URI from its error page and compare it, character by character, to the Authorized redirect URIs on the Google client.',
            'If sign-in succeeds but you land on the home page instead of where you asked, the problem is the Supabase Additional Redirect URLs list, not Google — add the missing URL there.',
            'Remember Google config changes can take a few minutes to propagate; if the URI looks correct, wait and retry before assuming it is wrong.',
          ],
          code: `Supabase dashboard — Authentication settings for KalaKaara

PROVIDERS -> Google
  Enabled ......... on
  Client ID ....... 123-abc.apps.googleusercontent.com     (from Google)
  Client secret ... GOCSPX-xxxxxxxxxxxxxxxx                 (from Google)

URL CONFIGURATION
  Site URL ................ http://localhost:5173
  Additional Redirect URLs
      http://localhost:5173/auth/callback
      https://kalakaara.vercel.app/auth/callback

--------------------------------------------------------------------
DIAGNOSING redirect_uri_mismatch  (shown by Google, not Supabase)

  Google prints the URI it actually received. Compare it, char by char,
  to your Authorized redirect URIs. Common differences:

    got:  https://abcdef.supabase.co/auth/v1/callback/     <- trailing /
    reg:  https://abcdef.supabase.co/auth/v1/callback

    got:  http://abcdef.supabase.co/auth/v1/callback       <- http not https
    got:  https://WRONGREF.supabase.co/auth/v1/callback    <- stale project ref

  Fix in Google -> Credentials -> your client -> Authorized redirect URIs.
  Changes can take a few minutes to take effect. Wait, then retry.

DIFFERENT SYMPTOM: sign-in works but lands on home page, not where asked
  -> the redirectTo is not in Supabase Additional Redirect URLs. Add it.`,
          pitfalls: [
            '**Reading `redirect_uri_mismatch` as a Supabase problem.** It is Google refusing the Supabase callback URI. Fix: edit the Authorized redirect URIs on the *Google* client, not any Supabase field.',
            '**Editing the Google client and retrying instantly.** Propagation can take minutes; you conclude the fix failed and change something correct into something wrong. Fix: make one precise change, wait, retry, then diagnose further.',
            '**Forgetting to add localhost AND the Vercel URL to Additional Redirect URLs.** It works locally, then sign-in silently dumps users on the home page in production. Fix: add every environment\'s `/auth/callback` up front.',
            '**Pasting the Client secret into your React code or a VITE_ env var.** The secret belongs only in Supabase, which does the exchange server-side. In a public bundle it is exposed. Fix: only the Supabase URL and anon key are ever public; the OAuth secret lives in Supabase alone.',
            '**Leaving the Supabase Site URL as localhost after deploying.** Magic links and default redirects then point at localhost for real users. Fix: switch Site URL to the production URL as part of the Module 15 deploy checklist.',
          ],
          tryIt:
            'Deliberately break it to learn the error: add a trailing slash to your Google Authorized redirect URI, save, and attempt sign-in. Read the `redirect_uri_mismatch` page and find where Google prints the URI it received. Then remove the slash and confirm it works. You now recognise this error on sight forever.',
          takeaway:
            'Paste the Google credentials into Supabase, set Site URL and Additional Redirect URLs for every environment, and remember: `redirect_uri_mismatch` is Google rejecting an exact-string comparison — fix it on the Google client.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Sessions in React',
      topics: [
        {
          id: 'm4-t4',
          title: 'signInWithOAuth: a full page navigation, not a fetch',
          explain:
            'Calling signInWithOAuth sends the whole browser to Google, which destroys your React app and all its state — so any intent must be saved outside React first.',
          analogy:
            'Sending a WhatsApp message keeps you in the chat; walking to the bank counter means leaving your seat entirely, and whatever you were holding on that seat is gone when you return. signInWithOAuth is walking to the counter, not sending a message. Your React state was on the seat.',
          theory:
            '`supabase.auth.signInWithOAuth({ provider: \'google\', options: { redirectTo } })` does **not** make a background request and hand you back a user. It triggers a **full-page navigation**: the browser leaves your site entirely and loads Google\'s consent page. This is the single most important mental shift in the module. A `fetch` keeps your React tree alive; a navigation tears it down. Every `useState`, every `useContext`, every unsaved form field, every variable — gone. When the user returns from Google, your app **boots from scratch** as a fresh page load.\n\nThat has a hard consequence: **anything you need on the other side of the redirect must be persisted outside React before you call `signInWithOAuth`.** There is no "after" in the same runtime. If a buyer tapped "Show phone number" on Rukmini\'s profile, the fact that they wanted Rukmini\'s number cannot live in a `useState` — that state will not survive the trip. It must go somewhere the new page load can read.\n\nTwo durable places exist. First, **`sessionStorage`** (or `localStorage`): write `{ action: \'reveal\', slug: \'rukmini-shetty\' }` before redirecting, read it back after. Second, and cleaner for the common case of "return me to this page," the **`redirectTo` URL itself**: encode the destination as a query parameter, e.g. `redirectTo = \${origin}/auth/callback?next=/artists/rukmini-shetty`. Supabase carries you back to that exact URL, and the callback page reads `?next=` and navigates there. The `redirectTo` approach is more robust across multiple tabs, because the intent travels *with* the redirect rather than sitting in shared storage that another tab might overwrite.\n\nOne more subtlety: `redirectTo` must be on Supabase\'s Additional Redirect URLs allow-list from the previous topic, or Supabase ignores it and uses the Site URL. So the `origin` you compute at runtime must match a URL you registered. Compute it as `window.location.origin` so localhost and production each produce their own registered value automatically.',
          diagram: `sequenceDiagram
    autonumber
    actor U as User on /artists/rukmini
    participant R as React (about to be destroyed)
    participant B as Browser
    participant G as Google

    U->>R: tap "Show phone number"
    R->>B: save intent OUTSIDE React<br/>(sessionStorage or redirectTo ?next=)
    R->>B: supabase.auth.signInWithOAuth({ redirectTo })
    B->>G: FULL PAGE NAVIGATION (React tree dies here)
    Note over R: all useState / context is gone
    U->>G: consent
    G-->>B: redirect back to redirectTo
    B->>R: fresh page load, React boots from zero
    R->>B: read saved intent, act on it`,
          flowExplain:
            'The "React tree dies here" note is the point. There is no continuous JavaScript execution across the redirect — the second React instance is a brand-new program that can only know what the first one wrote to durable storage or the URL.',
          whyItMatters:
            'The number-one confusion beginners have with OAuth in an SPA is expecting `signInWithOAuth` to return a user like an async function. It does not; it navigates away. Every "why is my state gone after login?" bug traces to this. Understanding it turns the intent-replay pattern (Module 10) from mysterious into obvious.',
          steps: [
            'Internalise the rule: `signInWithOAuth` navigates the whole browser away. It does not resolve to a user in the current runtime.',
            'Before calling it, persist any intent the far side needs — either in `sessionStorage` or encoded into the `redirectTo` URL as `?next=`.',
            'Compute `redirectTo` from `window.location.origin` so localhost and production each produce a value that is on the allow-list.',
            'Prefer encoding the destination in `redirectTo` over shared storage when the only intent is "come back to this page" — it survives multiple tabs cleanly.',
            'Never rely on React state, context, or a variable surviving the redirect. Assume the app restarts, because it does.',
          ],
          code: `// components/GoogleSignInButton.jsx
import { supabase } from '../supabase/client';

export function GoogleSignInButton({ next }) {
  async function signIn() {
    // next = where to return to, e.g. '/artists/rukmini-shetty'.
    // It rides ALONG WITH the redirect, so it survives the page reload.
    const redirectTo =
      \`\${window.location.origin}/auth/callback?next=\${encodeURIComponent(next || '/')}\`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // queryParams: { prompt: 'select_account' }, // optional: force chooser
      },
    });

    // If we reach here WITHOUT navigating, the redirect could not start.
    // On success the browser has already left the page, so this line is
    // effectively unreachable on the happy path.
    if (error) {
      console.error(error);
      // never render error.message raw to the user (see m4-t11)
    }
  }

  return (
    <button type="button" onClick={signIn}>
      Continue with Google
    </button>
  );
}

// The key idea: redirectTo carries the intent. React state does NOT
// survive the trip to Google, so nothing important may live only in state.`,
          pitfalls: [
            '**Awaiting `signInWithOAuth` and reading a user from it.** It returns before navigation and resolves to `{ data: { url, provider }, error }`, never a session. Fix: treat it as "start a redirect", not "get me a user".',
            '**Storing the post-login intent in `useState`.** The redirect destroys it. Fix: put intent in `sessionStorage` or the `redirectTo` URL before calling sign-in.',
            '**Hardcoding `redirectTo` to a fixed localhost URL.** It then breaks in production or is rejected by the allow-list. Fix: build it from `window.location.origin` so each environment is correct automatically.',
            '**Passing a `next` value straight into the URL without `encodeURIComponent`.** A query string in `next` corrupts the redirect. Fix: encode it going out and decode it coming back.',
            '**Forgetting the redirectTo must be allow-listed in Supabase.** An unlisted value is silently replaced by the Site URL and the user lands on the home page. Fix: register every `/auth/callback` origin (Module 4, topic 3).',
          ],
          tryIt:
            'Add a temporary `console.log` right after `signInWithOAuth` and watch the console during sign-in. You will see the log almost never runs to a useful conclusion, because the page navigates away first. That silence is the lesson: there is no "after" in this runtime.',
          takeaway:
            'signInWithOAuth is a full-page navigation that destroys your React app. Persist any intent in sessionStorage or the redirectTo URL before you call it — never in React state.',
        },
        {
          id: 'm4-t5',
          title: 'The /auth/callback route and exchangeCodeForSession',
          explain:
            'Google redirects back to /auth/callback with a code; supabase-js detects it, exchanges it for a session, and then you read ?next= and navigate onward.',
          analogy:
            'When you return from the temple office with your token slip, someone at the KalaKaara gate reads the slip, files it, gives you a wristband, and points you back to the exact counter you originally wanted. The /auth/callback route is that gate-keeper: it processes the slip and forwards you on. You do not linger there.',
          theory:
            'After consent, Google redirects the browser to your `redirectTo`, which in our design is `/auth/callback?code=...&next=...`. This route is a real React page, but it renders almost nothing — a spinner — because its only job is to finish the handshake and forward the user on.\n\nHow the code becomes a session depends on one client option. When you create the Supabase client with `detectSessionInUrl: true` (the default in supabase-js v2), the library **automatically** notices the OAuth parameters in the URL on load, calls `exchangeCodeForSession` under the hood using the PKCE verifier it stashed before the redirect, stores the resulting session, strips the code from the URL, and fires an `onAuthStateChange` event. In that common case your callback page does almost nothing itself: it waits for the session to appear, then navigates.\n\nIf you set `detectSessionInUrl: false`, or want explicit control, you call `supabase.auth.exchangeCodeForSession(window.location.href)` yourself. It performs the same exchange and returns `{ data: { session }, error }`. Either way, the PKCE verifier from topic 1 is consumed here — this is the step that proves the code is really yours.\n\nOnce a session exists, read `?next=` from the URL and navigate there with the router, using `replace` so the callback URL (with its now-spent code) does not sit in the back-history — pressing Back should never re-land on a dead callback URL. If there is no `next`, fall back to `/`. If the exchange failed — an expired code, a user who cancelled, a mangled URL — you do not crash; you route to `/login` with a friendly message (topic 11 handles the wording).\n\nOne guard matters: run the "read next and navigate" logic only *after* the session is confirmed, not on first paint, or you will forward the user before they are actually signed in. The cleanest implementation subscribes to the session (via the context from the next topics) and navigates when it flips from null to present.',
          diagram: `sequenceDiagram
    autonumber
    participant B as Browser at /auth/callback?code=..&next=..
    participant SDK as supabase-js
    participant G as Google
    participant Ctx as SessionContext

    B->>SDK: page loads, detectSessionInUrl sees ?code=
    SDK->>G: exchangeCodeForSession(code + stored verifier)
    G-->>SDK: tokens
    SDK->>SDK: store session, strip code from URL
    SDK-->>Ctx: onAuthStateChange('SIGNED_IN', session)
    Ctx-->>B: session is now present
    B->>B: read ?next=, navigate(next, { replace: true })
    Note over B: spinner the whole time; user never reads this page`,
          flowExplain:
            'With `detectSessionInUrl: true`, the SDK does the middle three steps for you. Your page only has to wait for the session and then forward using `replace`, so the spent callback URL never enters back-history.',
          whyItMatters:
            'A surprising number of "OAuth almost works" bugs are really "the callback page did the exchange twice" or "navigated before the session existed." Knowing that supabase-js v2 handles detection for you — and that your job is just to wait and forward with `replace` — keeps the callback page to a dozen correct lines instead of a fragile fifty.',
          steps: [
            'Create the Supabase client with `detectSessionInUrl: true` (the v2 default) and `flowType: \'pkce\'` so detection and PKCE are on.',
            'Add a `/auth/callback` route rendering a minimal page that shows a spinner.',
            'Let the SDK perform the exchange automatically, or call `exchangeCodeForSession(window.location.href)` explicitly if you turned detection off.',
            'When the session is confirmed present, read `?next=` from the URL and `navigate(next || \'/\', { replace: true })`.',
            'On an exchange error, navigate to `/login` with a friendly, non-raw message rather than throwing to a blank screen.',
            'Verify with the network tab that the code is exchanged exactly once and then stripped from the address bar.',
          ],
          code: `// pages/AuthCallbackPage.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../supabase/client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, loading } = useSession();

  useEffect(() => {
    // With detectSessionInUrl: true, supabase-js already exchanged the code.
    // We just wait for the session to be confirmed, then forward.
    if (loading) return;

    const next = params.get('next') || '/';

    if (session) {
      navigate(next, { replace: true }); // replace: dead callback URL leaves history
      return;
    }

    // No session after the SDK settled -> the exchange failed.
    // (expired code, user cancelled, mangled URL). Route to login, kindly.
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        navigate('/login?reason=auth_failed', { replace: true });
      }
      // success path re-fires onAuthStateChange -> session appears -> effect reruns
    })();
  }, [loading, session, params, navigate]);

  return <p role="status">Signing you in…</p>; // a spinner; nobody reads this page
}`,
          pitfalls: [
            '**Doing the exchange manually while `detectSessionInUrl` is also true.** Both try to spend the one-time code and the second fails. Fix: pick one — rely on detection, or turn it off and exchange yourself, not both.',
            '**Navigating away on first paint before the session is confirmed.** The user is forwarded while still logged out and the destination bounces them back. Fix: gate the navigation on `loading === false && session` (topic 6 explains the loading state).',
            '**Using `navigate(next)` without `replace`.** The spent callback URL stays in history and Back re-triggers a dead code exchange. Fix: always `{ replace: true }` here.',
            '**Rendering the raw error object on this page.** Users see cryptic OAuth strings. Fix: forward to `/login` with a friendly reason; topic 11 maps reasons to human messages.',
            '**Forgetting to strip the code from the URL.** Leaving `?code=` in the address bar means a copy-paste or refresh replays it. Fix: supabase-js strips it on detection; if you exchange manually, navigate with `replace` immediately after.',
          ],
          tryIt:
            'Sign in, then look at the address bar the instant you land back on the app. The `?code=...` should already be gone, replaced by your `next` destination. If you still see `code=`, your callback either did not run detection or navigated without `replace` — both are worth fixing before you move on.',
          takeaway:
            'The /auth/callback page is a spinner that waits for supabase-js to turn the code into a session, then forwards to ?next= with replace. supabase-js v2 does the exchange for you when detectSessionInUrl is on.',
        },
        {
          id: 'm4-t6',
          title: 'getSession vs onAuthStateChange, and the first-paint flash',
          explain:
            'getSession reads the current session once and is async, while onAuthStateChange fires on every future change — and mixing them up causes a one-frame flash of the logged-out UI.',
          analogy:
            'getSession is asking the temple register once, right now, "is this person a registered devotee?" onAuthStateChange is standing at the register and being told every time someone signs in or out. You need the snapshot to start, and the stream to stay current. Show the deity to no one until you have at least read the register once — otherwise you briefly turn away a devotee who was there all along.',
          theory:
            'supabase-js gives you two ways to know who is signed in, and you need both, for different reasons.\n\n**`supabase.auth.getSession()`** answers "who is signed in *right now*?" It reads the persisted session (from `localStorage` by default) and returns `{ data: { session }, error }`. Crucially, **it is asynchronous**. On the very first render of your app, you have not `await`-ed it yet, so you do not yet know whether anyone is logged in. If you assume "no session" during that gap and render the logged-out navbar, then a moment later `getSession` resolves with a real session and you re-render the logged-in navbar — the user sees a **flash of the wrong UI for one frame**. On a fast machine it is a flicker; on a slow phone it is a visible jump, and if a protected route reads that momentary null it can even bounce a logged-in user to /login and back.\n\n**`supabase.auth.onAuthStateChange((event, session) => ...)`** answers "tell me whenever it *changes*." It fires on sign-in, sign-out, token refresh, and — helpfully — once shortly after subscription with the initial state. It returns a subscription you must later unsubscribe (next topic). This is the live stream that keeps every component correct after the first paint.\n\nThe fix for the flash is a **`loading` state**. Start `loading` as `true` and render *nothing decisive* — a neutral splash or spinner — until you have resolved the initial session. Only when you actually know (session present or definitively absent) do you set `loading` to `false` and let the real UI render. In other words: never render the logged-in-or-out decision until you have an answer. This is why every consumer of auth in this app checks `loading` first, and why the `SessionContext` in the next topic exposes exactly `{ session, user, loading }`.',
          whyItMatters:
            'The logged-out flash is one of the most common and most visible auth bugs in React apps, and it is a favourite interview probe ("why might a signed-in user briefly see the sign-in button on refresh?"). The answer — the initial session read is async, so you must gate rendering on a loading flag — demonstrates you understand the difference between a one-shot read and a subscription.',
          steps: [
            'Understand the two calls: `getSession()` is a one-time async snapshot; `onAuthStateChange` is an ongoing subscription to changes.',
            'Recognise the gap: between first render and `getSession` resolving, you do not know the auth state.',
            'Introduce a `loading` flag, initialised `true`, and render a neutral placeholder while it is true.',
            'Set `loading` to `false` only after the initial session is resolved — either from `getSession()` or from the first `onAuthStateChange` event.',
            'Make every auth consumer (navbar, ProtectedRoute) check `loading` before deciding what to show, so none of them can act on a premature null.',
          ],
          code: `// A minimal illustration of the flash and its fix (the real version is
// the SessionContext in the next topic).

// BROKEN: assumes logged-out until proven otherwise -> one-frame flash
function useAuthNaive() {
  const [session, setSession] = useState(null); // <- lies for one render
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);
  return session; // navbar renders "Sign in" first, then swaps. Flicker.
}

// FIXED: a loading gate. Render nothing decisive until we truly know.
function useAuthCorrect() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // <- the fix

  useEffect(() => {
    // 1. one-shot snapshot for the initial paint
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false); // now we actually know
    });
    // 2. live stream for every later change (unsubscribe in the next topic)
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}

// Consumer:
//   if (loading) return <Splash />;      // no decision yet -> no flash
//   return session ? <UserMenu /> : <SignInButton />;`,
          pitfalls: [
            '**Initialising session to null and rendering immediately.** For one frame every signed-in user sees the logged-out UI. Fix: a `loading` flag that gates the decision until the snapshot resolves.',
            '**Using only `onAuthStateChange` and never `getSession`.** You still get an initial event, but leaning on it alone can leave `loading` true if the event ordering surprises you. Fix: read `getSession()` for the snapshot and subscribe for changes; belt and braces.',
            '**Letting a ProtectedRoute evaluate while `loading` is true.** It reads null, redirects to /login, then the session arrives and it bounces back — a visible round trip. Fix: ProtectedRoute shows a spinner while loading (topic 9).',
            '**Assuming `getSession` validates the token with the server.** It reads and can refresh from storage but is designed to be fast and local; do not treat its result as a fresh server verification. Fix: trust RLS on the server for authorization; use the session only to shape the UI.',
          ],
          tryIt:
            'Comment out the `loading` gate, sign in, then hard-refresh the page a few times while watching the navbar. You should catch the "Sign in" button flashing before your avatar appears. Restore the gate and the flash disappears. Seeing the bug once makes the fix permanent in your memory.',
          takeaway:
            'getSession is a one-shot async snapshot; onAuthStateChange is the live stream. Gate rendering on a loading flag so a signed-in user never flashes the logged-out UI on first paint.',
        },
        {
          id: 'm4-t7',
          title: 'Build SessionContext with a clean unsubscribe',
          explain:
            'One React context holds { session, user, loading }, subscribes to auth changes in a useEffect, and unsubscribes in the cleanup so you do not leak listeners.',
          analogy:
            'You register once at the temple seva counter and get a single receipt everyone in your family can show — you do not queue separately at every counter. SessionContext is that one receipt. And when you leave, you tear it up at the gate: the cleanup that cancels the subscription so the counter is not still holding a slip for a family that has gone home.',
          theory:
            'Authentication is genuinely global state: the navbar needs it, every protected route needs it, the favourites system needs it. That is exactly what React Context is for, and per the folder rules (Module 0) KalaKaara has exactly two contexts — `SessionContext` is one of them. There must be **exactly one** SessionContext provider, mounted once near the root, because a second provider would open a second `onAuthStateChange` subscription and the two could disagree.\n\nThe provider does three things in a single `useEffect` that runs once on mount:\n\n1. Reads the initial session with `getSession()` and sets `loading` to false (topic 6).\n2. Subscribes with `onAuthStateChange` to keep `session` current on every sign-in, sign-out, and token refresh.\n3. **Returns a cleanup function that unsubscribes.**\n\nThat third step is where the shape of the return value matters. `onAuthStateChange` returns `{ data: { subscription } }` — a nested object. The thing you must cancel is `data.subscription`, and you cancel it with `subscription.unsubscribe()`. So the idiomatic destructure is `const { data: { subscription } } = supabase.auth.onAuthStateChange(...)`, and the cleanup is `return () => subscription.unsubscribe()`. Miss the cleanup and every hot-reload in development, and every remount in production, stacks another live listener — so a single sign-out fires your handler three, five, ten times, and you get duplicated state updates and a slow memory leak.\n\nThe provider exposes `{ session, user, loading }`. `user` is just `session?.user ?? null`, offered for convenience because most components want the user, not the whole session. A tiny `useSession()` hook wraps `useContext(SessionContext)` and throws if used outside the provider — a guard that turns a confusing null into a clear error. Everything downstream — the navbar, `ProtectedRoute`, `useFavorites` — reads auth through this one hook and never calls `supabase.auth` directly.',
          diagram: `graph TD
    M[main.jsx] --> P[SessionProvider mounts ONCE]
    P --> E[useEffect on mount]
    E --> G[getSession -> initial snapshot, loading=false]
    E --> SUB["onAuthStateChange(...)<br/>returns { data: { subscription } }"]
    SUB --> ST[setSession on every change]
    E --> CL[cleanup: subscription.unsubscribe]
    P --> V[provides { session, user, loading }]
    V --> H[useSession hook]
    H --> N[Navbar]
    H --> PR[ProtectedRoute]
    H --> F[useFavorites]
    style CL fill:#fecaca
    style SUB fill:#bbf7d0`,
          flowExplain:
            'The green box is the odd shape you must destructure correctly — `{ data: { subscription } }`. The red box is the cleanup that cancels it. Forget the red box and every remount leaks another listener.',
          whyItMatters:
            'The `useEffect` subscribe/unsubscribe pattern is one of the most-tested React skills, and auth is its canonical use. Interviewers ask "what does the cleanup function in that effect do?" precisely because forgetting it is so common. A clean unsubscribe also prevents the duplicated-handler bugs that are miserable to diagnose in production.',
          steps: [
            'Create `contexts/SessionContext.jsx` with `createContext` and a `SessionProvider`.',
            'In a mount-only `useEffect`, call `getSession()` for the snapshot and set `loading` to false.',
            'Subscribe with `onAuthStateChange`, destructuring `const { data: { subscription } } = ...`.',
            'Return `() => subscription.unsubscribe()` from the effect so remounts do not stack listeners.',
            'Provide `{ session, user: session?.user ?? null, loading }` and export a `useSession()` hook that throws if used outside the provider.',
            'Mount `<SessionProvider>` exactly once, wrapping the router in `main.jsx` — never a second instance.',
          ],
          code: `// contexts/SessionContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const SessionContext = createContext(undefined);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. initial snapshot (async) -> resolves the first-paint flash
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    // 2. live stream. NOTE the nested shape: { data: { subscription } }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      }
    );

    // 3. cleanup: cancel the subscription so remounts don't stack listeners
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = { session, user: session?.user ?? null, loading };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (ctx === undefined) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return ctx; // { session, user, loading }
}`,
          pitfalls: [
            '**Forgetting `subscription.unsubscribe()` in the cleanup.** Every remount and every hot-reload adds a listener; one sign-out then fires the handler many times. Fix: always return the unsubscribe from the effect.',
            '**Destructuring the wrong level.** `const { subscription } = onAuthStateChange(...)` is undefined; the shape is `{ data: { subscription } }`. Fix: destructure `data.subscription`, then call `.unsubscribe()`.',
            '**Mounting two SessionProviders.** Two subscriptions, two sources of truth, occasional disagreement. Fix: exactly one provider near the root; assert it with the throwing `useSession` guard.',
            '**Putting other unrelated state in this context.** It re-renders every consumer on every auth change; extra state amplifies that. Fix: keep it to `{ session, user, loading }`; favourites live in their own context.',
            '**Reading `supabase.auth.getUser()` in every component instead of the context.** That is a network call per component. Fix: subscribe once in the context and read the cached user through `useSession()`.',
          ],
          tryIt:
            'Temporarily delete the `return () => subscription.unsubscribe()` line, then edit and save the file a few times to trigger hot reloads, and sign out once. Watch a `console.log` inside the handler fire multiple times. Restore the cleanup and it fires once. That is the memory leak made visible.',
          takeaway:
            'One SessionContext, mounted once, subscribes in a useEffect and unsubscribes in the cleanup. The subscription hides inside { data: { subscription } }; cancel it or remounts stack listeners.',
        },
        {
          id: 'm4-t8',
          title: 'Persistence, refresh, and signing out cleanly',
          explain:
            'Supabase stores the JWT in localStorage, refreshes it automatically before it expires, and fires events you can react to; signOut clears it and you must clear your own app state too.',
          analogy:
            'A monthly bus pass sits in your wallet (localStorage), and the depot quietly renews it before it lapses so you never notice (auto-refresh). When you hand it back at the counter (signOut), you must also empty your own bag of the day\'s tickets — favourites, cached profile — or you will keep flashing an expired pass around town.',
          theory:
            'By default supabase-js **persists the session in `localStorage`** under a key like `sb-<ref>-auth-token`. Persistence is why a signed-in user stays signed in across refreshes and browser restarts — on load, `getSession()` reads it back. You can change the storage (e.g. to memory for a kiosk) via the client\'s `auth.storage` option, but `localStorage` is the sensible default for KalaKaara.\n\nThe access token (JWT) is deliberately short-lived — an hour by default — so a leaked token has a small window of use. Supabase keeps a longer-lived **refresh token** and, with `autoRefreshToken: true` (the default), **silently exchanges it for a fresh access token before expiry**. You do not schedule this; the client does. Each refresh fires an `onAuthStateChange` event with type `TOKEN_REFRESHED`, and because your `SessionContext` subscribes, the new session flows into your app automatically — no code of yours runs the refresh.\n\nThe events worth knowing:\n- `INITIAL_SESSION` — emitted once with the state at subscription time.\n- `SIGNED_IN` — a sign-in completed (also fires after a successful code exchange).\n- `TOKEN_REFRESHED` — the access token was renewed; the session object changed but the user did not.\n- `SIGNED_OUT` — the session ended; `session` is now null.\n\n**`supabase.auth.signOut()`** revokes the session, removes it from storage, and fires `SIGNED_OUT`. But signing out of Supabase does **not** clear *your* app state. If `FavoritesContext` cached the previous user\'s favourite ids, or a component still holds their profile, those linger until you clear them. So the discipline is: sign out, and on the `SIGNED_OUT` event reset every piece of user-specific state. Because `SessionContext` sets `session` to null on that event, downstream contexts can watch the session and clear themselves when it becomes null — which is exactly how `FavoritesContext` behaves in Module 11.\n\nOne nuance for shared computers: `signOut()` defaults to a global scope, ending the session everywhere. That is usually what you want; `signOut({ scope: \'local\' })` ends only this browser if you ever need it.',
          whyItMatters:
            'Understanding that the JWT lives in localStorage and refreshes itself explains both why sessions survive refreshes and why the anon key is not what authorizes a user (Module 3): the JWT is. And the "clear your own state on sign-out" discipline prevents the classic bug where a second user on a shared laptop briefly sees the first user\'s favourites.',
          steps: [
            'Know where the session lives: `localStorage`, key `sb-<ref>-auth-token`, by default. This is why refreshes keep you signed in.',
            'Leave `autoRefreshToken` on so the client renews the short-lived access token before it expires — you write no timer.',
            'Recognise the events: `INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`, and what each means for `session`.',
            'Implement sign-out by calling `supabase.auth.signOut()`; do not manually delete localStorage keys.',
            'On the `SIGNED_OUT` event (session becomes null), reset user-specific app state — favourites, cached profile — so nothing from the previous user lingers.',
          ],
          code: `// A sign-out button and the state-clearing discipline.

// components/SignOutButton.jsx
import { supabase } from '../supabase/client';

export function SignOutButton() {
  async function signOut() {
    const { error } = await supabase.auth.signOut(); // clears Supabase storage
    if (error) console.error(error); // never show raw error text (m4-t11)
    // Do NOT manually rm localStorage keys; signOut owns that.
    // Do NOT navigate here relying on state; let SIGNED_OUT drive the UI.
  }
  return <button type="button" onClick={signOut}>Sign out</button>;
}

// contexts/FavoritesContext.jsx (sketch) — clear on sign-out
// Because SessionContext sets session=null on SIGNED_OUT, watch it:
//
//   const { session } = useSession();
//   useEffect(() => {
//     if (!session) {
//       setFavoriteIds(new Set()); // wipe previous user's data
//       return;
//     }
//     loadFavorites(session.user.id).then(setFavoriteIds);
//   }, [session]);
//
// Result: sign out -> SIGNED_OUT -> session null -> favourites cleared.
// A second user on the same laptop never sees the first user's saves.

// Events you will observe on the subscription:
//   INITIAL_SESSION  once at start
//   SIGNED_IN        after login / code exchange
//   TOKEN_REFRESHED  silent hourly-ish renewal (user unchanged)
//   SIGNED_OUT       session is now null -> clear your own state`,
          pitfalls: [
            '**Manually deleting the `sb-...-auth-token` from localStorage to "log out".** It leaves the in-memory client and refresh timer confused. Fix: call `supabase.auth.signOut()` and let it manage storage.',
            '**Not clearing app state on sign-out.** The next user on a shared device sees the previous user\'s favourites for a moment. Fix: reset user-specific state on the `SIGNED_OUT` event / when session becomes null.',
            '**Writing your own token-refresh timer.** It fights `autoRefreshToken` and double-refreshes. Fix: leave the default on and react to `TOKEN_REFRESHED` if you need to; never schedule it yourself.',
            '**Treating `TOKEN_REFRESHED` as a new login.** The user did not change, only the token did; re-running "on login" side effects duplicates them. Fix: branch on the event type, or compare `user.id`, before firing login-only logic.',
            '**Assuming localStorage persistence is secure storage.** A stored JWT is readable by any script on your origin, which is why the token is short-lived and RLS is the real guard. Fix: keep XSS out (Module 15) and rely on RLS, not on hiding the token.',
          ],
          tryIt:
            'Sign in, open DevTools → Application → Local Storage, and find the `sb-<ref>-auth-token` entry. Refresh the page and confirm you stay signed in (that entry is why). Then click Sign out and watch the key disappear. You have now seen persistence, restore, and revocation with your own eyes.',
          takeaway:
            'The JWT lives in localStorage and auto-refreshes before expiry; signOut clears Supabase storage but not your app state, so wipe user-specific data on the SIGNED_OUT event.',
        },
      ],
    },
    {
      id: 'm4-s3',
      title: 'Gating, and the profile that creates itself',
      topics: [
        {
          id: 'm4-t9',
          title: 'ProtectedRoute: gate /dashboard and /favourites',
          explain:
            'ProtectedRoute reads the session, shows a spinner while loading, redirects to /login when signed out, and renders the child route otherwise.',
          analogy:
            'The archaka-only area behind the seva counter has one gatekeeper. If they are still checking your slip, they ask you to wait (loading). If you are not registered, they walk you to the registration desk and remember which counter you wanted (redirect with state). If you belong, they wave you through (Outlet). One gate, three outcomes.',
          theory:
            'A **ProtectedRoute** is a small component that wraps the routes only signed-in users may see — in KalaKaara that is `/dashboard` and `/favourites`. In react-router v6 the clean pattern is a **layout route**: ProtectedRoute renders `<Outlet />` (the matched child) when access is granted, and a `<Navigate>` when it is not. It has exactly three outcomes, and the order is not negotiable:\n\n1. **`loading` is true** → render a spinner. This is the crucial one. If you skip it and evaluate the session while the initial `getSession` is still pending (topic 6), a signed-in user is momentarily seen as null, redirected to /login, then bounced back when the session resolves — a visible flicker and a broken back button. Never decide access while loading.\n2. **No session** → `<Navigate to="/login" state={{ from: location }} replace />`. You send the user to the login page, and you attach `state.from = location` so the login page knows where they were trying to go and can return them there after sign-in. This is the intent-preservation pattern that makes "I clicked Favourites, signed in, and landed on Favourites" feel seamless.\n3. **Signed in** → `<Outlet />`, which renders the protected child (`DashboardPage`, `FavouritesPage`).\n\nWhy `replace` on the Navigate? Without it, the redirect **pushes** `/login` onto the history stack on top of `/dashboard`. After signing in and returning to `/dashboard`, pressing the browser Back button lands on `/login`, which — now that they are signed in — redirects forward to `/dashboard` again: the Back button appears frozen. With `replace`, the `/login` entry **substitutes** the `/dashboard` attempt in history rather than stacking on it, so Back goes to wherever the user genuinely came from. `replace` on a guard redirect is not a nicety; it is what makes the Back button behave.\n\nWiring it in the router: nest the protected pages inside a `<Route element={<ProtectedRoute />}>`. Both `/dashboard` and `/favourites` sit under that one element, so the guard is written once and applied to both.',
          diagram: `graph TD
    R[Enter /dashboard or /favourites] --> L{loading?}
    L -- yes --> SP[Render spinner<br/>decide nothing yet]
    L -- no --> S{session exists?}
    S -- no --> NAV["Navigate to /login<br/>state = { from: location }<br/>replace"]
    S -- yes --> O[Outlet -> render the protected page]
    NAV --> LOGIN[/login remembers 'from'<br/>and returns you after sign-in/]
    style SP fill:#fde68a
    style NAV fill:#fecaca
    style O fill:#bbf7d0`,
          flowExplain:
            'The three outcomes in order: spinner while loading (never decide early), redirect-with-from when signed out, Outlet when signed in. The `replace` on that redirect is what keeps the Back button sane after the user returns.',
          whyItMatters:
            'Route guarding is a staple of every real app and a common interview task. The subtle parts — checking loading before deciding, passing `from` so login can return the user, and using `replace` so Back is not trapped — are exactly what separates a guard that "works on the happy path" from one that behaves correctly under real navigation.',
          steps: [
            'Create `components/ProtectedRoute/ProtectedRoute.jsx` consuming `useSession()`.',
            'If `loading`, return a spinner and decide nothing.',
            'If there is no session, return `<Navigate to="/login" state={{ from: location }} replace />` using `useLocation()` for `location`.',
            'Otherwise return `<Outlet />` to render the matched protected child.',
            'In the router, nest `/dashboard` and `/favourites` inside a single `<Route element={<ProtectedRoute />}>`.',
            'On the login page, read `location.state?.from` and navigate back there after a successful sign-in.',
          ],
          code: `// components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';

export default function ProtectedRoute() {
  const { session, loading } = useSession();
  const location = useLocation();

  // 1. Still resolving the initial session -> decide NOTHING yet.
  if (loading) return <p role="status">Loading…</p>;

  // 2. Definitely signed out -> go to /login, remembering where we were.
  //    replace: so Back after login doesn't land back on /login.
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Signed in -> render the matched child route.
  return <Outlet />;
}

// App.jsx (router excerpt)
// <Routes>
//   <Route element={<MainLayout />}>
//     <Route path="/" element={<HomePage />} />
//     <Route path="/artists/:slug" element={<ArtistDetailPage />} />
//     <Route path="/login" element={<LoginPage />} />
//     <Route path="/auth/callback" element={<AuthCallbackPage />} />
//
//     {/* one guard, both protected pages under it */}
//     <Route element={<ProtectedRoute />}>
//       <Route path="/dashboard" element={<DashboardPage />} />
//       <Route path="/favourites" element={<FavouritesPage />} />
//     </Route>
//   </Route>
// </Routes>`,
          pitfalls: [
            '**Checking `session` before `loading`.** During the async snapshot the session reads null, so a signed-in user is redirected then bounced back. Fix: `if (loading) return <Spinner/>` must come first, always.',
            '**Omitting `replace` on the Navigate.** The Back button gets trapped in a /login ↔ /dashboard loop. Fix: `replace` so the guard redirect substitutes rather than stacks history.',
            '**Not passing `state={{ from: location }}`.** After sign-in the login page has no idea where to send the user, so everyone lands on the home page. Fix: attach `from` and read it on the login page.',
            '**Guarding each page with its own copy of the logic.** It drifts out of sync and duplicates bugs. Fix: one `ProtectedRoute` layout route wrapping every protected page.',
            '**Treating ProtectedRoute as security.** It only hides UI; a determined user can still call the API. Fix: real protection is RLS in Postgres (Module 3) — the route guard is UX, not a security boundary.',
          ],
          tryIt:
            'While signed out, type `/dashboard` into the address bar. You should be redirected to /login. Sign in, and confirm you land back on /dashboard, not the home page — that is `state.from` working. Now press Back and confirm you do not get stuck on /login — that is `replace` working.',
          takeaway:
            'ProtectedRoute has three ordered outcomes: spinner while loading, Navigate to /login with from + replace when signed out, Outlet when signed in. replace keeps the Back button from looping.',
        },
        {
          id: 'm4-t10',
          title: 'The profile that creates itself: handle_new_user, from React',
          explain:
            'Because a Postgres trigger creates the profiles row the moment a user signs up, your React code finds the profile already there after sign-in and never inserts it itself.',
          analogy:
            'At a well-run temple, the moment you register at the main desk, a clerk in the back office writes your name into the seva ledger automatically — you do not walk to the ledger yourself. The trigger is that back-office clerk: registration and ledger entry happen together, atomically, so there is never a registered devotee missing from the book.',
          theory:
            'In Module 3 you wrote a trigger — conventionally `handle_new_user()` — that fires **after insert on `auth.users`** and inserts a matching row into `public.profiles`, copying the id, email, and any name/avatar Google supplied. This topic revisits it from the React side, because its payoff only becomes visible now: **after a user signs in for the first time, their `profiles` row already exists.** Your React code does not create it, check for it, or race to insert it. It is simply there.\n\nProve it, do not take it on faith. Sign in with a brand-new Google account, then query `profiles` for `id = auth.uid()` — the row is present, created in the same transaction that created the auth user. Because the trigger runs inside Supabase\'s signup transaction, the profile and the auth user are born together or not at all.\n\nNow picture the alternative the trigger saves you from: creating the profile **from React** after sign-in, e.g. an `insert into profiles` in your callback. Two failure modes make this fragile:\n\n1. **Dropped network.** The user signs in successfully, then the follow-up insert request fails — a flaky 4G moment, a closed tab, a crash. You now have an **authenticated user with no profile row**: an orphan. Every later query that joins profiles returns nothing, and you spend an evening debugging a "logged in but broken" account. The trigger cannot half-run; it is atomic with the signup.\n2. **Two tabs / double fire.** OAuth can produce more than one `SIGNED_IN` event (a refresh, a second tab completing the same flow). A client-side "insert my profile" then runs twice and either throws a duplicate-key error you must handle or, if written carelessly, creates inconsistent state. The trigger fires exactly once, on the single `auth.users` insert.\n\nThe rule this teaches generalises: **derive dependent rows in the database, at the moment of the event, not in the client after the fact.** The client is the wrong place for "this must always happen exactly once alongside sign-up," because the client can drop, double, or be closed. Postgres cannot. From React you only ever *read* the profile and *update* it (name, bio) — you never create it.',
          diagram: `graph TD
    subgraph good[Trigger approach - what we do]
      A[User signs in with Google] --> B[Supabase inserts into auth.users]
      B --> T[Trigger handle_new_user fires<br/>IN THE SAME TRANSACTION]
      T --> P[public.profiles row created]
      P --> R1[React just READS the profile - already there]
    end
    subgraph bad[Client-insert approach - what we avoid]
      A2[User signs in] --> B2[auth.users created]
      B2 --> N{React runs insert profiles}
      N -- network drops --> O1[Authenticated user,<br/>NO profile row: orphan]
      N -- fires twice/2 tabs --> O2[Duplicate insert error]
    end
    style T fill:#bbf7d0
    style O1 fill:#fecaca
    style O2 fill:#fecaca`,
          flowExplain:
            'Left: the profile is born atomically with the auth user, so React only reads it. Right: the client insert can drop (orphan) or double-fire (duplicate). The trigger removes both failure modes by construction.',
          whyItMatters:
            'This is a favourite system-design question: "where do you create the user profile after OAuth sign-up?" The strong answer — a database trigger, because it is atomic with the auth insert and cannot be dropped or duplicated by the client — signals you think about failure modes, not just the happy path. It is also simply correct: countless apps have orphaned users from a client-side insert that failed.',
          steps: [
            'Recall the Module 3 trigger: `after insert on auth.users` calls `handle_new_user()`, which inserts into `public.profiles`.',
            'Sign in with a fresh Google account through KalaKaara.',
            'Query `profiles` for `id = auth.uid()` and confirm the row already exists — you never inserted it.',
            'Reason through the client-insert failure modes: a dropped network leaves an orphan; a double-fired event causes a duplicate insert.',
            'Adopt the rule: from React, only read and update the profile; never create it. Creation belongs to the trigger.',
          ],
          code: `-- Recap from Module 3: the trigger that makes this work.
-- (You already ran this; it is here to connect it to the React side.)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;   -- idempotent: safe even if it somehow re-fires
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- From React you only READ it. Proof the row is already there:

// services/profileService.js
export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', userId)
    .single();               // exactly one row is EXPECTED to exist already
  if (error) throw new Error('Could not load your profile');
  return data;               // it exists because the trigger made it. We never insert.
}`,
          pitfalls: [
            '**Inserting the profile from the auth callback.** A dropped network between sign-in and insert leaves an authenticated user with no profile. Fix: the trigger creates it atomically; React only reads.',
            '**Making the client insert idempotent instead of moving it to the DB.** You are patching a symptom; the orphan case from a dropped request remains. Fix: create at the source of the event — the `auth.users` insert — not after it in the client.',
            '**Forgetting `on conflict do nothing` in the trigger.** A rare re-fire then errors. Fix: make the insert idempotent so the trigger is safe under any event ordering.',
            '**Assuming the profile might not exist and coding defensive "create if missing" everywhere.** It clutters every read and re-introduces the double-insert risk. Fix: trust the invariant the trigger guarantees — signed-in implies profile exists.',
            '**Not granting the trigger the rights to insert.** Without `security definer` it runs as the caller and RLS can block the insert. Fix: `security definer` with a pinned `search_path`, as in Module 3.',
          ],
          tryIt:
            'Sign in with a Google account you have never used on KalaKaara before. Immediately open the Supabase table editor (or run the `getMyProfile` query) and find your new `profiles` row. You did not write a single line of insert code — the trigger did it in the same breath as creating your auth user.',
          takeaway:
            'A Postgres trigger creates the profiles row atomically with sign-up, so React only ever reads it. A client-side insert risks orphaned users on a dropped network and duplicates across tabs.',
        },
        {
          id: 'm4-t11',
          title: 'Auth error states, honestly',
          explain:
            'OAuth fails in specific, recognisable ways — popup blocked, user cancels, redirect_uri_mismatch, expired code, offline — and each deserves a calm, human message, never a raw Supabase error string.',
          analogy:
            'When a bus is cancelled, the good conductor says "the 4 o\'clock is off, the next one is at 5" — not the raw fault code from the depot computer. Your auth errors are depot codes; users need the conductor\'s sentence, the one that tells them what happened and what to do next.',
          theory:
            'Sign-in is a distributed operation across your app, Google, and Supabase, so it fails in more ways than a normal form submit. Handle each deliberately, and **never render a raw error object or message to the user** — those strings leak internals, frighten non-technical people, and sometimes reveal more than they should. Map each failure to a short, honest, actionable sentence.\n\nThe failures you will actually see:\n\n- **Popup blocked** — if you ever use a popup-based flow, the browser may block it. Message: "Your browser blocked the sign-in window. Please allow pop-ups for this site and try again." (KalaKaara uses full-page redirect, which sidesteps this, but know it exists.)\n- **User cancels consent** — they close Google\'s page or click Cancel. Google returns `error=access_denied`. This is **not a bug** and must not look like one. Message: "Sign-in was cancelled. You can try again whenever you like." No red alarm, no stack trace.\n- **`redirect_uri_mismatch`** — a configuration error (topic 3), visible to *you* during setup, not to end users once fixed. If it ever reaches a user, show: "Sign-in is temporarily unavailable. Please try again shortly." — and fix the config. Never show the raw Google page copy as your app\'s UI.\n- **Expired or already-used code** — the user took too long, or refreshed the callback, so `exchangeCodeForSession` fails. Message: "That sign-in link has expired. Please sign in again." and route them back to /login.\n- **Network offline** — the exchange request cannot reach Supabase. Message: "You appear to be offline. Check your connection and try again." Detect via the thrown network error (and optionally `navigator.onLine`).\n\nThe implementation pattern is a single **mapper**: catch the error, classify it (by `error.message`, an OAuth `error` query param, or the failed request), and return one of a small set of user-facing strings from a constants file. Log the real error to the console for yourself; show the mapped sentence to the user. This keeps raw strings out of the UI and keeps your copy consistent. Treat cancellation as a neutral, expected outcome — the most common "error" of all is a user who simply changed their mind, and it should feel like nothing went wrong.',
          diagram: `graph TD
    F[Auth attempt fails] --> C{Classify}
    C -- access_denied --> M1[Neutral: 'Sign-in was cancelled.<br/>Try again anytime.']
    C -- popup blocked --> M2['Allow pop-ups and try again.']
    C -- redirect_uri_mismatch --> M3['Temporarily unavailable.<br/>Try again shortly.' + fix config]
    C -- expired/used code --> M4['That link expired.<br/>Please sign in again.']
    C -- network error --> M5['You appear offline.<br/>Check your connection.']
    M1 --> LOG[Log the REAL error to console for you]
    M2 --> LOG
    M3 --> LOG
    M4 --> LOG
    M5 --> LOG
    LOG --> UI[Render only the mapped sentence -<br/>never the raw error string]
    style UI fill:#bbf7d0`,
          flowExplain:
            'Every branch ends the same way: log the real error for the developer, show only the mapped human sentence to the user. Cancellation (top branch) is neutral, not an alarm.',
          whyItMatters:
            'Error handling is where junior and senior work visibly differ. Rendering `error.message` is the junior tell; classifying failures and writing calm, actionable copy — especially treating cancellation as normal — is what makes an app feel trustworthy. Interviewers and users both notice.',
          steps: [
            'Enumerate the real failure modes: cancelled consent, popup blocked, redirect_uri_mismatch, expired/used code, offline.',
            'Write one short, human, actionable sentence for each, stored in `constants/`, never inline.',
            'Build a `mapAuthError(error)` function that classifies the failure and returns the right sentence, defaulting to a generic "Something went wrong signing you in. Please try again."',
            'Log the real error to the console (or your error tracker) for yourself; render only the mapped sentence.',
            'Treat cancellation as neutral — no red, no "error", just a calm note that they can try again.',
          ],
          code: `// constants/authMessages.js
export const AUTH_MESSAGES = Object.freeze({
  cancelled: 'Sign-in was cancelled. You can try again whenever you like.',
  popupBlocked: 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
  unavailable: 'Sign-in is temporarily unavailable. Please try again shortly.',
  expired: 'That sign-in link has expired. Please sign in again.',
  offline: 'You appear to be offline. Check your connection and try again.',
  generic: 'Something went wrong signing you in. Please try again.',
});

// utils/mapAuthError.js
import { AUTH_MESSAGES } from '../constants/authMessages';

export function mapAuthError(error, urlParams) {
  // 1. user closed Google's consent page
  const oauthError = urlParams?.get('error');
  if (oauthError === 'access_denied') return AUTH_MESSAGES.cancelled;

  const msg = (error?.message || '').toLowerCase();

  // 2. classify by the message / cause
  if (msg.includes('popup')) return AUTH_MESSAGES.popupBlocked;
  if (msg.includes('redirect_uri_mismatch')) return AUTH_MESSAGES.unavailable;
  if (msg.includes('expired') || msg.includes('invalid code') ||
      msg.includes('code verifier')) return AUTH_MESSAGES.expired;
  if (msg.includes('failed to fetch') || msg.includes('network') ||
      (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return AUTH_MESSAGES.offline;
  }

  return AUTH_MESSAGES.generic;
}

// Usage on the login / callback page:
//   console.error(error);                 // the REAL error, for you
//   setNotice(mapAuthError(error, params)); // the human sentence, for them
//   // render <p role="alert">{notice}</p> — never {error.message}`,
          pitfalls: [
            '**Rendering `error.message` straight into the UI.** It leaks internals and reads as a crash. Fix: map every error to a curated sentence; log the raw one only to the console.',
            '**Treating a cancelled sign-in as an error.** Users who change their mind should not see a red alarm. Fix: classify `access_denied` as neutral and word it gently.',
            '**Showing the setup-time `redirect_uri_mismatch` copy to end users.** It is your configuration bug, meaningless to them. Fix: show "temporarily unavailable" and fix the config (topic 3).',
            '**No default branch in the mapper.** An unforeseen error then renders as `undefined` or a raw string. Fix: always fall back to a generic, polite message.',
            '**Swallowing the real error entirely.** With nothing logged, you cannot diagnose production failures. Fix: log the true error for yourself while showing the mapped sentence to the user.',
          ],
          tryIt:
            'Start a sign-in, then click Cancel on Google\'s consent screen. Confirm your app returns you to /login showing a calm "Sign-in was cancelled" note, not a scary error. Then, offline (DevTools → Network → Offline), attempt sign-in and confirm you get the "you appear to be offline" message. Two realistic failures, two humane responses.',
          takeaway:
            'OAuth fails in a handful of recognisable ways; classify each and show a calm, actionable sentence. Cancellation is normal, not an error, and a raw Supabase string must never reach the user.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Mini Project',
      title: 'Google Sign-In, Sessions, and Two Protected Routes',
      domain: 'Authentication & Session Management',
      duration: '2 hours',
      description:
        'Wire Google OAuth end to end in the real KalaKaara app: a working sign-in via Supabase, a single SessionContext with a clean unsubscribe, a navbar that swaps between Sign in and an avatar + Sign out, a ProtectedRoute guarding /dashboard and /favourites, a /login page that returns the user to exactly where they came from, and a step that proves the profiles row was created by the Module 3 trigger — not by any React code.',
      tools: ['React', 'React Router v6', 'Supabase', 'Google OAuth', 'Context API'],
      blueprint: {
        overview:
          'By the end you can sign into KalaKaara with Google, refresh the page and stay signed in, be sent to /login when you visit a protected page while signed out, land back on that page after signing in, and sign out cleanly. Along the way you confirm — with a query, not a hope — that your profiles row already exists because a Postgres trigger created it. All of this stays inside the zero-cost, card-free stack: Supabase Auth and a free Google OAuth client.',
        functionalRequirements: [
          '**Working Google OAuth.** A Continue-with-Google button starts a full-page redirect, Google consent succeeds, and you return to the app signed in, with the code exchanged and stripped from the URL.',
          '**Single SessionContext.** Exactly one provider exposing `{ session, user, loading }`, subscribed via onAuthStateChange and unsubscribed in the effect cleanup; a `useSession()` hook that throws outside the provider.',
          '**Adaptive navbar.** Signed out shows Sign in; signed in shows the user\'s Google avatar and a Sign out button. No logged-out flash on refresh.',
          '**ProtectedRoute over two pages.** `/dashboard` and `/favourites` sit under one ProtectedRoute: spinner while loading, redirect to /login with `from` and `replace` when signed out, Outlet when signed in.',
          '**/login returns you home to your intent.** After sign-in the user lands on the page they originally tried to reach (via `location.state.from` or `?next=`), not on the site root.',
          '**Clean sign-out.** signOut ends the session and any user-specific app state is cleared on SIGNED_OUT.',
          '**Proof of the trigger.** A visible step (query or table view) showing the profiles row exists after first sign-in, with no client-side insert anywhere in the code.',
        ],
        technicalImplementation: [
          '**supabase/client.js** created once with `auth: { detectSessionInUrl: true, flowType: \'pkce\', autoRefreshToken: true, persistSession: true }`.',
          '**contexts/SessionContext.jsx** with the getSession snapshot + onAuthStateChange subscription + cleanup pattern from topic 7, providing `{ session, user, loading }`.',
          '**pages/AuthCallbackPage.jsx** that waits for the session, reads `?next=`, and navigates with `{ replace: true }`; **pages/LoginPage.jsx** with the Google button and `location.state.from` handling.',
          '**components/ProtectedRoute/ProtectedRoute.jsx** as a layout route rendering Outlet / Navigate; wired in App.jsx around /dashboard and /favourites.',
          '**utils/mapAuthError.js + constants/authMessages.js** so no raw Supabase error string ever reaches the UI.',
          '**No insert into profiles anywhere in React** — the Module 3 `handle_new_user` trigger owns creation; React only reads it.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Configure Google + Supabase and the client',
            outcome:
              'A free Google OAuth client wired into Supabase, and a Supabase client configured for PKCE and session persistence.',
            prompt:
              'Walk me through creating a Google OAuth client in Google Cloud Console for KalaKaara without enabling any billing account: External consent screen, app name KalaKaara, scopes limited to email and profile, my own email as a test user, a Web application client with Authorized JavaScript origin http://localhost:5173 and Authorized redirect URI https://<my-project-ref>.supabase.co/auth/v1/callback. Then show me exactly where in the Supabase dashboard to enable the Google provider, paste the Client ID and secret, set the Site URL to http://localhost:5173, and add http://localhost:5173/auth/callback to Additional Redirect URLs. Finally, write src/supabase/client.js creating the client once from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with auth options detectSessionInUrl true, flowType pkce, autoRefreshToken true, persistSession true. Explain why the redirect URI points at Supabase and not at my app, and confirm nothing in this step asked for a credit card.',
          },
          {
            step: 2,
            label: 'SessionContext with a clean unsubscribe',
            outcome:
              'contexts/SessionContext.jsx providing { session, user, loading } with a correct subscribe/unsubscribe and a useSession hook.',
            prompt:
              'Create src/contexts/SessionContext.jsx. In a SessionProvider, use a single mount-only useEffect that (a) calls supabase.auth.getSession() for the initial snapshot and sets loading to false, and (b) subscribes with supabase.auth.onAuthStateChange, destructuring const { data: { subscription } } = ... and returning () => subscription.unsubscribe() as the cleanup. Start loading at true so a signed-in user never flashes the logged-out UI. Provide { session, user: session?.user ?? null, loading }. Export a useSession() hook that throws a clear error if used outside the provider. Then mount exactly one SessionProvider around the router in main.jsx. Explain in comments why there must be exactly one provider and what the cleanup prevents.',
          },
          {
            step: 3,
            label: 'Login page, callback page, and the adaptive navbar',
            outcome:
              'A working sign-in: Google button, /auth/callback that forwards to the intended page, and a navbar that swaps Sign in for avatar + Sign out.',
            prompt:
              'Create src/pages/LoginPage.jsx with a Continue-with-Google button that calls supabase.auth.signInWithOAuth with provider google and redirectTo set to `${window.location.origin}/auth/callback?next=${encodeURIComponent(dest)}`, where dest is location.state?.from?.pathname or "/". Create src/pages/AuthCallbackPage.jsx that reads useSession, waits until loading is false, and if a session exists navigates to the ?next value with { replace: true }; if the exchange failed, route to /login with a friendly reason. Update the navbar to use useSession: while loading render a neutral placeholder; signed out render a Sign in link to /login; signed in render the user\'s Google avatar (user.user_metadata.avatar_url) and a Sign out button calling supabase.auth.signOut(). Make sure there is no logged-out flash on refresh.',
          },
          {
            step: 4,
            label: 'ProtectedRoute over /dashboard and /favourites',
            outcome:
              'One ProtectedRoute guarding both pages, with loading spinner, from-preserving redirect, and replace.',
            prompt:
              'Create src/components/ProtectedRoute/ProtectedRoute.jsx as a react-router v6 layout route. Consume useSession(): if loading, render a spinner and decide nothing; if there is no session, return <Navigate to="/login" state={{ from: location }} replace /> using useLocation(); otherwise return <Outlet />. In App.jsx, nest both /dashboard and /favourites inside a single <Route element={<ProtectedRoute />}>. Explain, in comments, why the loading check must come before the session check, and why replace is required so the browser Back button does not get trapped looping between /login and /dashboard after sign-in.',
          },
          {
            step: 5,
            label: 'Prove the trigger, then harden the error states',
            outcome:
              'A demonstration that the profiles row exists after first sign-in with no client insert, plus humane auth error handling.',
            prompt:
              'First, prove the profiles row is created by the Module 3 handle_new_user trigger, not by React: after I sign in with a fresh Google account, give me a src/services/profileService.js getMyProfile(userId) that selects my profiles row by id and single(), and a temporary dashboard line that displays it — then confirm there is no insert into profiles anywhere in the React codebase (grep for it). Explain what would have gone wrong with a client-side insert: a dropped network leaving an authenticated user with no profile, and a double-fired SIGNED_IN across two tabs causing a duplicate insert. Second, add src/constants/authMessages.js and src/utils/mapAuthError.js so that cancelled consent, popup blocked, redirect_uri_mismatch, expired code, and offline each map to a calm, actionable sentence; wire them into LoginPage and AuthCallbackPage so the raw Supabase error is only ever console.logged, never rendered. Treat a cancelled sign-in as neutral, not an error.',
          },
        ],
        deliverable:
          'A running KalaKaara where Google sign-in works end to end, the session survives refresh, a single SessionContext cleanly subscribes and unsubscribes, the navbar adapts without flashing, /dashboard and /favourites are gated by one ProtectedRoute, /login returns the user to where they came from, sign-out is clean, and you have proven — by query, not by faith — that the profiles row was created by the database trigger. No credit card was entered at any point.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'In the Authorization Code flow with PKCE, what stops an attacker who intercepts the authorization code from redeeming it?',
      options: [
        'The code is encrypted end to end so it cannot be read in transit',
        'The token exchange also requires the code verifier, a secret that never left the original browser, so a stolen code alone cannot be exchanged',
        'Authorization codes are tied to the attacker\'s IP address and rejected elsewhere',
        'Google phones the user to confirm every code exchange',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'Why is the Supabase anon key, which ships in the public bundle, not what authenticates a signed-in user?',
      options: [
        'The anon key is encrypted at build time so it cannot be reused',
        'The anon key rotates on every request, so it cannot identify anyone',
        'The anon key only identifies the API and caller type; it is the Supabase session JWT (minted after the OAuth exchange) that carries the user identity that auth.uid() reads',
        'The anon key does authenticate the user; the JWT is only for refreshing it',
      ],
      answer: 2,
    },
    {
      id: 'm4-q3',
      q: 'Why must the useEffect that subscribes to onAuthStateChange return a cleanup that calls subscription.unsubscribe()?',
      options: [
        'Otherwise every remount or hot-reload stacks another live listener, so a single auth change fires the handler multiple times and leaks memory',
        'Otherwise the initial getSession snapshot never resolves',
        'Because Supabase charges per active subscription on the free tier',
        'Because without it the JWT will not be stored in localStorage',
      ],
      answer: 0,
    },
    {
      id: 'm4-q4',
      q: 'A signed-in user hard-refreshes and briefly sees the Sign in button before their avatar appears. What causes this and what fixes it?',
      options: [
        'The anon key loads slowly; fix by caching it in a service worker',
        'onAuthStateChange fires too often; fix by debouncing the handler',
        'The refresh token expired; fix by increasing the token lifetime in Supabase',
        'getSession is async, so for one frame the app assumes logged-out; fix with a loading flag that gates rendering until the initial session resolves',
      ],
      answer: 3,
    },
    {
      id: 'm4-q5',
      q: 'Sign-in fails and Google shows redirect_uri_mismatch. Where is the problem and how do you fix it?',
      options: [
        'The redirect URI Supabase sent does not exactly match an Authorized redirect URI on the Google OAuth client; fix the exact string (scheme, ref, trailing slash) in the Google client',
        'The Supabase anon key is wrong; regenerate it in the dashboard',
        'The user is not in the profiles table; run the handle_new_user trigger',
        'React Router is missing the /auth/callback route; add the route',
      ],
      answer: 0,
    },
    {
      id: 'm4-q6',
      q: 'Why is the new user\'s profiles row created by a Postgres trigger on auth.users rather than by an insert from React after sign-in?',
      options: [
        'Because React is forbidden by RLS from ever inserting into profiles',
        'The trigger creates it atomically with the auth user, so it cannot be left out; a client insert can be dropped by a flaky network (orphaned user) or double-fire across two tabs (duplicate)',
        'Triggers run faster than a client insert, improving sign-in latency',
        'Supabase does not expose an insert endpoint for the profiles table',
      ],
      answer: 1,
    },
    {
      id: 'm4-q7',
      q: 'Why does ProtectedRoute use <Navigate to="/login" ... replace /> instead of a plain (pushing) navigation when redirecting a signed-out user?',
      options: [
        'replace makes the redirect faster by skipping a render',
        'replace is required for state={{ from: location }} to be passed at all',
        'Without replace the JWT would not be attached to the /login request',
        'replace substitutes the attempted URL in history instead of stacking /login on top, so after signing in and returning, the Back button does not get trapped looping between /login and the protected page',
      ],
      answer: 3,
    },
  ],
}

// Module 3 — Authentication & Authorization: Google OAuth + Roles
// Wires Google sign-in, auto-created AppUsers, and role-based access into TunMani Resort.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m3 = {
  id: 'm3',
  title: 'Authentication & Authorization: Google OAuth + Roles',
  hours: 8,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Configure cookie + Google OAuth authentication, build the login flow that auto-creates an AppUser with a role, and lock down controllers and dashboards by role.',
  sections: [
    {
      id: 'm3-s1',
      title: 'Cookie + Google OAuth',
      topics: [
        {
          id: 'm3-t1',
          title: 'Authentication vs authorization & the cookie scheme',
          explain:
            'Authentication proves who you are; authorization decides what you may do. ASP.NET Core remembers the proven identity in a signed cookie.',
          analogy:
            'At TunMani Resort, the security gate first checks your face against your staff ID — that is authentication, proving who you are. Then a separate sign at each door says "managers only" or "staff only" — that is authorization, deciding where you may go. The wristband they clip on at the gate, which every inner door reads without re-checking your ID, is the authentication cookie.',
          theory:
            '**Authentication** answers "who are you?"; **authorization** answers "are you allowed to do this?". They are two different steps and you configure them separately.\n\nIn ASP.NET Core you register an **authentication scheme**. The **cookie scheme** issues an encrypted, signed cookie once a user signs in; the browser sends it on every request, so the user stays logged in without re-entering credentials. You configure it in **`Program.cs`** with `AddAuthentication(...).AddCookie(...)`, setting an **`ExpireTimeSpan`** (e.g. 8 hours), **`SlidingExpiration`** (the clock resets on activity), and paths: **`LoginPath`** (`/Account/Login`), **`LogoutPath`**, and **`AccessDeniedPath`**.\n\nTwo middleware lines — `app.UseAuthentication()` then `app.UseAuthorization()` — must run **in that order** for the cookie to be read before access is checked.',
          whyItMatters:
            'Every protected screen in TunMani Resort — the booking dashboard, the invoice tools, the user manager — depends on this foundation. An 8-hour sliding cookie keeps front-desk staff logged in through a shift without nagging them, while the login/access-denied paths give clean redirects instead of raw 401/403 errors. Getting the two middleware lines in the right order is a classic gotcha.',
          steps: [
            'Open `Program.cs`.',
            'Call `builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)`.',
            'Chain `.AddCookie(...)` and set `ExpireTimeSpan` to 8 hours.',
            'Enable `SlidingExpiration = true`.',
            'Set `LoginPath`, `LogoutPath`, and `AccessDeniedPath`.',
            'Add `app.UseAuthentication()` then `app.UseAuthorization()` — in that order.',
            'Confirm an unauthenticated request to a protected page redirects to `/Account/Login`.',
          ],
          code: `// Program.cs — cookie authentication setup.
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.ExpireTimeSpan   = TimeSpan.FromHours(8);   // a full shift
        options.SlidingExpiration = true;                    // reset on activity
        options.LoginPath        = "/Account/Login";
        options.LogoutPath       = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
    });

builder.Services.AddControllersWithViews();

var app = builder.Build();

app.UseRouting();
app.UseAuthentication();   // 1. read the cookie, build the identity
app.UseAuthorization();    // 2. THEN check if it is allowed
app.MapControllers();
app.Run();`,
          pitfalls: [
            '**Calling `UseAuthorization()` before `UseAuthentication()`.** The identity is not built when access is checked, so everything looks anonymous. Fix: authentication first.',
            '**Forgetting `app.UseAuthentication()` entirely.** `[Authorize]` blocks everyone. Fix: add it after `UseRouting`.',
            '**No `LoginPath`.** Unauthenticated users get a raw 401 instead of a login page. Fix: set the paths.',
            '**A very short `ExpireTimeSpan`.** Staff get logged out mid-shift. Fix: 8 hours with sliding expiration.',
            '**Confusing authentication with authorization.** They are separate steps. Fix: configure the scheme, then apply `[Authorize]`.',
            '**Non-HTTPS cookies in production.** The cookie can be stolen. Fix: serve over HTTPS so the cookie is secure.',
          ],
          tryIt:
            'Configure the cookie scheme with an 8-hour sliding expiration and the three paths. Put `[Authorize]` on a test controller, run the app, and confirm an anonymous visit redirects to `/Account/Login` rather than showing a 401.',
          takeaway: 'Authentication proves identity (a signed cookie), authorization checks access; UseAuthentication must run before UseAuthorization.',
        },
        {
          id: 'm3-t2',
          title: 'Adding Google as an external login provider',
          explain:
            'Layer `AddGoogle(...)` on top of the cookie scheme so staff can sign in with their Google account instead of a password you have to store.',
          analogy:
            'Rather than TunMani Resort printing and managing its own staff ID cards (passwords), it trusts the government-issued Aadhaar at the gate — a credential someone else already verified. `AddGoogle` is exactly that: Google has already verified the staff member’s identity, and the resort simply trusts Google’s confirmation and issues its own wristband (the cookie).',
          theory:
            '**Google OAuth** lets users sign in with their Google account. ASP.NET Core adds it with **`.AddGoogle(...)`** chained after the cookie scheme. Google authenticates the user and hands back **claims** — most importantly the **email** — and your app then issues its *own* cookie.\n\nYou supply a **ClientId** and **ClientSecret** obtained from Google Cloud Console. These are secrets: read them from configuration (user-secrets in development, environment variables / a vault in production), never hard-code them.\n\nA robust pattern registers Google **conditionally** — only if both values are configured — so the app still runs in environments where Google is not set up (it just falls back to cookie-only). The cookie remains the primary scheme; Google is the external sign-in that *populates* that cookie.',
          whyItMatters:
            'Outsourcing identity to Google means TunMani Resort never stores or leaks passwords, and staff use an account they already have. The conditional registration keeps local development and CI running even without Google credentials. Knowing how to wire an external OAuth provider is a core, frequently-asked ASP.NET Core skill.',
          steps: [
            'Add the `Microsoft.AspNetCore.Authentication.Google` package.',
            'Read `Authentication:Google:ClientId` and `ClientSecret` from configuration.',
            'Only call `.AddGoogle(...)` if both values are present.',
            'Set the ClientId and ClientSecret inside the Google options.',
            'Keep the cookie scheme as the default (sign-in) scheme.',
            'Store the secrets with user-secrets in development.',
            'Confirm the app still starts when Google is not configured.',
          ],
          code: `// Program.cs — add Google conditionally on top of the cookie scheme.
var googleId     = builder.Configuration["Authentication:Google:ClientId"];
var googleSecret = builder.Configuration["Authentication:Google:ClientSecret"];

var authBuilder = builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.ExpireTimeSpan    = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        options.LoginPath         = "/Account/Login";
        options.AccessDeniedPath  = "/Account/AccessDenied";
    });

// Only register Google if it is actually configured.
if (!string.IsNullOrWhiteSpace(googleId) &&
    !string.IsNullOrWhiteSpace(googleSecret))
{
    authBuilder.AddGoogle(options =>
    {
        options.ClientId     = googleId;
        options.ClientSecret = googleSecret;
        // CallbackPath defaults to "/signin-google".
    });
}`,
          pitfalls: [
            '**Hard-coding the ClientSecret in source.** It leaks the moment you push to GitHub. Fix: use user-secrets / environment variables.',
            '**Calling `.AddGoogle` unconditionally with empty values.** The app throws at startup in environments without Google. Fix: register it only when configured.',
            '**Expecting Google to be the cookie store.** Google only authenticates; your app issues the cookie. Fix: keep cookie as the sign-in scheme.',
            '**Wrong configuration key path.** The values come back null. Fix: match `Authentication:Google:ClientId` exactly.',
            '**Committing user-secrets to the repo.** Defeats the purpose. Fix: user-secrets live outside the project tree.',
            '**Forgetting the NuGet package.** `AddGoogle` does not compile. Fix: add `Microsoft.AspNetCore.Authentication.Google`.',
          ],
          tryIt:
            'Add the Google package and the conditional `.AddGoogle` block reading ClientId/ClientSecret from configuration. Run the app with no Google config set and confirm it still starts (cookie-only). Then add dummy values and confirm `.AddGoogle` is reached.',
          takeaway: 'AddGoogle layers external sign-in onto the cookie scheme; register it conditionally and read its secrets from configuration.',
        },
        {
          id: 'm3-t3',
          title: 'Creating Google OAuth credentials & the redirect URI',
          explain:
            'In Google Cloud Console you create an OAuth client and register the exact callback URI (`/signin-google`) Google will redirect back to after sign-in.',
          analogy:
            'Before TunMani Resort can trust Aadhaar at its gate, it must register itself with the authority and state exactly which gate the verified guest will be sent back to. The redirect URI is that registered gate address: if a stranger tries to send a verified login to a different, unregistered door, Google refuses — protecting against impersonation.',
          theory:
            'OAuth requires you to **register your application** with Google. In **Google Cloud Console** you create a project, configure the **OAuth consent screen**, then create an **OAuth 2.0 Client ID** of type "Web application". Google gives you the **ClientId** and **ClientSecret**.\n\nThe critical setting is the **Authorized redirect URI** — the URL Google sends the user back to after they approve. For ASP.NET Core Google auth this defaults to **`/signin-google`**, so you register e.g. `https://localhost:7001/signin-google` for development and `https://tunmaniresort.in/signin-google` for production. It must match **exactly** — protocol, host, port, and path.\n\nYou then store the ClientId/ClientSecret with **`dotnet user-secrets`** in development and as environment variables (or a key vault) in production, mirrored under `Authentication:Google` in `appsettings`.',
          whyItMatters:
            'A mismatched or unregistered redirect URI is the single most common reason Google sign-in fails with `redirect_uri_mismatch`. Registering each environment’s callback correctly and storing the secrets safely is what makes the login actually work — and keeps the resort’s credentials out of source control. This is hands-on knowledge every OAuth integration needs.',
          steps: [
            'In Google Cloud Console, create a project and configure the OAuth consent screen.',
            'Create an OAuth 2.0 Client ID of type "Web application".',
            'Add Authorized redirect URI `https://localhost:7001/signin-google` for dev.',
            'Add the production URI `https://tunmaniresort.in/signin-google`.',
            'Copy the ClientId and ClientSecret.',
            'Store them with `dotnet user-secrets set "Authentication:Google:ClientId" "..."`.',
            'In production, set them as environment variables, not in appsettings.json.',
          ],
          code: `# 1. Initialise user-secrets for the project (run once).
dotnet user-secrets init

# 2. Store the Google credentials OUTSIDE source control.
dotnet user-secrets set "Authentication:Google:ClientId"     "1234-abc.apps.googleusercontent.com"
dotnet user-secrets set "Authentication:Google:ClientSecret" "GOCSPX-your-secret-here"

# 3. appsettings.json only DECLARES the shape (no real values committed):
# {
#   "Authentication": {
#     "Google": { "ClientId": "", "ClientSecret": "" }
#   }
# }

# 4. Authorized redirect URIs to register in Google Cloud Console:
#    Development : https://localhost:7001/signin-google
#    Production  : https://tunmaniresort.in/signin-google
#    (path "/signin-google" is the ASP.NET Core Google default callback)`,
          pitfalls: [
            '**Redirect URI mismatch (http vs https, wrong port).** Google returns `redirect_uri_mismatch`. Fix: register the exact URI, scheme and port included.',
            '**Putting real secrets in appsettings.json and committing them.** Credentials leak. Fix: user-secrets in dev, env vars in prod.',
            '**Forgetting to add the production redirect URI.** Login works locally but breaks live. Fix: register every environment’s callback.',
            '**Leaving the consent screen unconfigured.** Google blocks the flow. Fix: complete the OAuth consent screen.',
            '**Assuming a custom callback path without setting it.** Mismatch. Fix: keep the default `/signin-google` or set `CallbackPath` to match.',
            '**Reusing one OAuth client across unrelated apps.** Hard to revoke. Fix: one client per app.',
          ],
          tryIt:
            'Create an OAuth client in Google Cloud Console, register `https://localhost:7001/signin-google`, and store the ClientId/ClientSecret with `dotnet user-secrets`. Run the app and confirm the configuration values load (e.g. log whether Google was registered) without any secret appearing in your committed files.',
          takeaway: 'Register an exact /signin-google redirect URI in Google Cloud Console and keep the ClientId/ClientSecret in user-secrets, not source.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'The Login Flow',
      topics: [
        {
          id: 'm3-t4',
          title: 'The AppUser entity and the four roles',
          explain:
            'An `AppUser` row (Id, Email, Name, Role, IsActive, CreatedAt) records who may use the app and as what — with roles admin, manager, staff, and auditor.',
          analogy:
            'Google proves a person is who they say they are, but it does not know they work at TunMani Resort. The `AppUser` table is the resort’s own staff register: it lists which Google emails belong to staff, their job role on the property, and whether they are still employed. A verified Google user who is not in this register is a stranger at the gate.',
          theory:
            'Google tells you the user’s **email**, but your app must decide whether that person is allowed in and what they can do. That decision lives in your own **`AppUser`** entity: `Id`, **`Email`** (the link to the Google identity), `Name`, **`Role`**, **`IsActive`**, and `CreatedAt`.\n\nThe app defines four **roles**:\n- **admin** — full control, including user management.\n- **manager** — bookings, invoices, reports.\n- **staff** — day-to-day front-desk work.\n- **auditor** — read-only access to records and reports.\n\n**`IsActive`** lets you disable a user (a staff member leaves) without deleting their history — the same soft-delete idea as rooms. The user’s role becomes a **claim** in their cookie, which authorization then checks on every protected action.',
          whyItMatters:
            'Authentication alone (a valid Google account) is not enough — billions of Google accounts exist. The `AppUser` register is what restricts access to actual resort staff and assigns each one a role. Roles drive every authorization rule and dashboard redirect in the app, so getting this entity and its roles right underpins all of Module 3.',
          steps: [
            'Create `Domain/Entities/AppUser.cs`.',
            'Add `Id`, `Email`, `Name`, `Role`, `IsActive`, `CreatedAt`.',
            'Treat `Email` as the unique link to the Google identity.',
            'Define the allowed roles: admin, manager, staff, auditor.',
            'Default new users to a safe low-privilege role (e.g. staff).',
            'Create an `app_users` table with a unique `email` column.',
            'Add an `IAppUserRepository` to look users up by email.',
          ],
          code: `// Domain/Entities/AppUser.cs — the resort's own user register.
namespace TunManiResort.Domain.Entities;

public class AppUser
{
    public int Id { get; set; }
    public string Email { get; set; } = "";   // links to the Google account
    public string Name { get; set; } = "";
    public string Role { get; set; } = "staff"; // admin|manager|staff|auditor
    public bool IsActive { get; set; } = true;   // soft-disable, not delete
    public DateTime CreatedAt { get; set; }
}

// Roles used across the app:
public static class Roles
{
    public const string Admin   = "admin";
    public const string Manager = "manager";
    public const string Staff   = "staff";
    public const string Auditor = "auditor";
}

/* app_users table:
   CREATE TABLE app_users (
       id         SERIAL PRIMARY KEY,
       email      TEXT NOT NULL UNIQUE,        -- one row per Google email
       name       TEXT NOT NULL,
       role       TEXT NOT NULL DEFAULT 'staff',
       is_active  BOOLEAN NOT NULL DEFAULT true,
       created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
*/`,
          pitfalls: [
            '**Treating any valid Google login as authorized.** Billions of accounts get in. Fix: require a matching active `AppUser`.',
            '**No unique constraint on `email`.** Duplicate users, ambiguous lookups. Fix: `UNIQUE` on `email`.',
            '**Deleting users who leave.** Their booking/audit history is orphaned. Fix: set `IsActive = false`.',
            '**Defaulting new users to admin.** Anyone who logs in gets full control. Fix: default to the lowest role (staff).',
            '**Free-typing role strings everywhere.** Typos break checks. Fix: centralise them in a `Roles` constants class.',
            '**Storing the role only in the cookie, not the database.** Cannot manage users. Fix: the database is the source of truth.',
          ],
          tryIt:
            'Create the `AppUser` entity, the `Roles` constants, and the `app_users` table. Seed one admin user with your own email and a couple of staff users. Confirm the `email` unique constraint rejects a duplicate insert.',
          takeaway: 'AppUser (email, role, IsActive) is the resort’s own register that turns a verified Google login into an authorized, roled user.',
        },
        {
          id: 'm3-t5',
          title: 'Login & ExternalLogin: challenging Google',
          explain:
            'The `AccountController` `Login` action shows the sign-in page, and `ExternalLogin` issues a challenge that bounces the user to Google.',
          analogy:
            'The `Login` page is the TunMani Resort reception desk where a staff member walks up to sign in. `ExternalLogin` is the receptionist walking them over to the Aadhaar verification counter (Google) and saying "verify them, then send them back to me at this exact desk". The challenge is that hand-off to Google with a return address attached.',
          theory:
            'The flow lives in an **`AccountController`**. **`Login`** is a simple `[AllowAnonymous]` GET action returning a view with a "Sign in with Google" button.\n\nClicking it posts to **`ExternalLogin`**, which builds an **authentication challenge** for the Google scheme. You call **`Challenge(properties, GoogleDefaults.AuthenticationScheme)`**, where `properties.RedirectUri` points at your **callback** action (`ExternalLoginCallback`). ASP.NET Core then redirects the browser to Google’s consent screen.\n\nThe **`returnUrl`** is threaded through so that after a successful login the user lands back where they were headed. Both actions are `[AllowAnonymous]` because, by definition, the user is not yet signed in. The actual sign-in cookie is issued later, in the callback (next topic).',
          whyItMatters:
            'This is the entry point to the whole auth system — the button a staff member clicks each morning. Issuing the challenge correctly, with the right callback redirect and a preserved `returnUrl`, is what makes Google sign-in feel seamless. Marking these actions `[AllowAnonymous]` is essential, or the login page itself would require login — a chicken-and-egg lockout.',
          steps: [
            'Create `Controllers/AccountController.cs`.',
            'Add a `[AllowAnonymous]` `Login(string? returnUrl)` GET action returning a view.',
            'Add an `ExternalLogin(string? returnUrl)` action.',
            'Build `AuthenticationProperties` with `RedirectUri` to the callback.',
            'Return `Challenge(properties, GoogleDefaults.AuthenticationScheme)`.',
            'Thread `returnUrl` through to the callback.',
            'Add a "Sign in with Google" button to the Login view posting to `ExternalLogin`.',
          ],
          code: `// Controllers/AccountController.cs — Login + ExternalLogin.
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class AccountController : Controller
{
    [AllowAnonymous]
    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        return View();   // a page with a "Sign in with Google" button
    }

    [AllowAnonymous]
    [HttpPost]
    public IActionResult ExternalLogin(string? returnUrl = null)
    {
        // Where Google should send the user back to in OUR app.
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback),
                                      "Account", new { returnUrl });

        var props = new AuthenticationProperties { RedirectUri = redirectUrl };

        // Bounce the browser to Google's consent screen.
        return Challenge(props, GoogleDefaults.AuthenticationScheme);
    }
}`,
          pitfalls: [
            '**Forgetting `[AllowAnonymous]` on Login/ExternalLogin.** A global `[Authorize]` locks users out of the login page itself. Fix: allow anonymous on auth actions.',
            '**RedirectUri pointing at the wrong action.** Google returns the user nowhere useful. Fix: point it at `ExternalLoginCallback`.',
            '**Losing the `returnUrl`.** Users land on the home page instead of where they were going. Fix: thread it through the challenge.',
            '**Challenging the cookie scheme instead of Google.** No external sign-in happens. Fix: `Challenge(..., GoogleDefaults.AuthenticationScheme)`.',
            '**An open redirect via an unvalidated `returnUrl`.** Phishing risk. Fix: validate it is a local URL before using it.',
            '**Using GET for `ExternalLogin` and triggering it accidentally.** Fix: POST it from a form button.',
          ],
          tryIt:
            'Build the `Login` view with a "Sign in with Google" button and the `ExternalLogin` action returning a Challenge. Click the button and confirm the browser is redirected to Google’s consent screen with your callback in the URL.',
          takeaway: 'Login shows the page; ExternalLogin issues a Google Challenge with a RedirectUri back to your callback — both [AllowAnonymous].',
        },
        {
          id: 'm3-t6',
          title: 'ExternalLoginCallback: auto-creating the AppUser & signing in',
          explain:
            'After Google returns, the callback reads the email claim, finds or creates an `AppUser`, then signs the user in by issuing a cookie that includes their Role claim.',
          analogy:
            'Google sends the verified staff member back to the TunMani Resort desk with a slip proving their email. The receptionist checks the staff register: if the person is already listed, great; if not (and they are allowed in), a new register entry is created with a default role. Then the receptionist clips on the wristband (the cookie) stamped with that role — and from now on every inner door reads the wristband, not the slip.',
          theory:
            'In **`ExternalLoginCallback`** you first read the result of the Google sign-in and pull the **email claim** (`ClaimTypes.Email`).\n\nYou then **look up the `AppUser`** by that email. If found and active, use their stored role. If not found, you may **auto-create** an `AppUser` with a default role (e.g. staff) — or reject if your policy is invite-only. Either way, the **database is the source of truth** for the role.\n\nFinally you **sign in**: build a `ClaimsIdentity` containing the user’s email/name and crucially a **Role claim** (`new Claim(ClaimTypes.Role, user.Role)`), wrap it in a `ClaimsPrincipal`, and call **`HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal)`**. That writes the cookie. Then redirect by role (next section).',
          whyItMatters:
            'This callback is where external identity becomes an app session. Embedding the **Role claim** in the cookie is what makes later `[Authorize(Roles = ...)]` checks instant — no database hit per request. Auto-creating the `AppUser` smooths onboarding (a new manager just logs in), while the active/role lookup keeps control in the resort’s hands, not Google’s.',
          steps: [
            'Add `ExternalLoginCallback(string? returnUrl)` to `AccountController`.',
            'Authenticate the external result and read the `Email` claim.',
            'Look up the `AppUser` by email via the repository.',
            'If none exists, create one with a default role and `IsActive = true`.',
            'Reject the login if the user exists but `IsActive` is false.',
            'Build a `ClaimsIdentity` with email, name, and a `ClaimTypes.Role` claim.',
            'Call `SignInAsync(...)` to issue the cookie, then redirect by role.',
          ],
          code: `// AccountController.ExternalLoginCallback — find/create AppUser, sign in.
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

[AllowAnonymous]
public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null)
{
    // 1. Read what Google returned.
    var result = await HttpContext.AuthenticateAsync(
        GoogleDefaults.AuthenticationScheme);
    var email = result.Principal?.FindFirstValue(ClaimTypes.Email);
    var name  = result.Principal?.FindFirstValue(ClaimTypes.Name) ?? email;

    if (string.IsNullOrEmpty(email))
        return RedirectToAction(nameof(Login));

    // 2. Find or auto-create the AppUser; the DB owns the role.
    var user = await _users.GetByEmailAsync(email);
    if (user is null)
    {
        user = new AppUser { Email = email, Name = name!, Role = Roles.Staff };
        user.Id = await _users.CreateAsync(user);     // default role = staff
    }
    if (!user.IsActive) return RedirectToAction(nameof(AccessDenied));

    // 3. Issue OUR cookie with a Role claim baked in.
    var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.Name, user.Name),
        new(ClaimTypes.Role, user.Role),             // drives authorization
    };
    var identity = new ClaimsIdentity(
        claims, CookieAuthenticationDefaults.AuthenticationScheme);
    await HttpContext.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(identity));

    return RedirectToRoleHome(user.Role, returnUrl);   // next section
}`,
          pitfalls: [
            '**Not adding a `ClaimTypes.Role` claim.** `[Authorize(Roles=...)]` never matches. Fix: include the role claim when signing in.',
            '**Trusting Google for the role.** Google does not know your roles. Fix: read the role from your `AppUser` table.',
            '**Auto-creating users as admin.** Anyone with a Google account gets full control. Fix: default to staff (or invite-only).',
            '**Ignoring `IsActive`.** Disabled staff can still log in. Fix: block inactive users.',
            '**Reading the email from the wrong claim type.** Comes back null. Fix: use `ClaimTypes.Email`.',
            '**Forgetting to await `SignInAsync`.** The cookie is not written. Fix: `await` it before redirecting.',
          ],
          tryIt:
            'Implement `ExternalLoginCallback` to read the email, find-or-create an `AppUser`, and sign in with a Role claim. Log in with a brand-new Google email and confirm a new `app_users` row is created with role staff and that the cookie now carries that role.',
          takeaway: 'The callback turns Google’s email into a signed-in session: find/create the AppUser, then issue a cookie carrying the Role claim.',
        },
        {
          id: 'm3-t7',
          title: 'Logout, AccessDenied & session validation',
          explain:
            'Add `Logout` (sign out the cookie), `AccessDenied` (the page shown on insufficient permission), and a check that forces re-login for old cookies missing a role claim.',
          analogy:
            'At the end of a shift the staff member hands back their wristband (`Logout`). If they wander to a manager-only door without the right band, a polite "staff not permitted here" sign greets them (`AccessDenied`). And if the resort recently changed its wristband design, the old-style bands are no longer accepted — the wearer must get a fresh one at the desk. That last rule is session validation: cookies issued before roles existed are rejected.',
          theory:
            '**`Logout`** calls **`SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme)`** to clear the cookie, then redirects to the login page. It should be a POST guarded by `[ValidateAntiForgeryToken]` so a malicious site cannot log users out via CSRF.\n\n**`AccessDenied`** is the `[AllowAnonymous]` page configured as `AccessDeniedPath`. When an authenticated user lacks the required role, ASP.NET Core sends them here (a 403-style experience) instead of the login page.\n\n**Session validation** handles cookies issued *before* you added roles. Using cookie events (e.g. `OnValidatePrincipal`) you check that the principal has a **Role claim**; if it is missing, you **reject the cookie** so the user is forced to sign in again and receive a fresh, role-bearing cookie. This prevents stale sessions from silently bypassing role checks.',
          whyItMatters:
            'A clean logout and a friendly access-denied page are basic UX every app needs. Session validation is the subtle but important part: when you evolve the auth model (adding roles), old cookies in the wild must not become a backdoor. Forcing them to re-login keeps every active session consistent with the current role system.',
          steps: [
            'Add a `[HttpPost][ValidateAntiForgeryToken]` `Logout` action.',
            'Call `await HttpContext.SignOutAsync(...)` and redirect to `Login`.',
            'Add an `[AllowAnonymous]` `AccessDenied` action and view.',
            'In the cookie options, set an `OnValidatePrincipal` event.',
            'In the event, check for a `ClaimTypes.Role` claim.',
            'If missing, call `RejectPrincipal()` and sign the user out.',
            'Confirm an old role-less cookie now forces a fresh login.',
          ],
          code: `// Logout + AccessDenied + session validation for old cookies.
using Microsoft.AspNetCore.Authentication.Cookies;

// --- In AccountController ---
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Logout()
{
    await HttpContext.SignOutAsync(
        CookieAuthenticationDefaults.AuthenticationScheme);
    return RedirectToAction(nameof(Login));
}

[AllowAnonymous]
public IActionResult AccessDenied() => View();

// --- In Program.cs cookie options: reject role-less (old) cookies ---
.AddCookie(options =>
{
    options.LoginPath        = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.Events = new CookieAuthenticationEvents
    {
        OnValidatePrincipal = ctx =>
        {
            var hasRole = ctx.Principal?.HasClaim(c => c.Type == ClaimTypes.Role);
            if (hasRole != true)
            {
                ctx.RejectPrincipal();              // old cookie -> sign out
                return ctx.HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
            }
            return Task.CompletedTask;
        }
    };
});`,
          pitfalls: [
            '**Logout as a GET link.** A `<img>` tag on another site can log users out (CSRF). Fix: POST it with an anti-forgery token.',
            '**Redirecting access-denied users to Login.** Confusing — they are already logged in. Fix: use a dedicated `AccessDenied` page.',
            '**No session validation after adding roles.** Old role-less cookies bypass role checks. Fix: reject them in `OnValidatePrincipal`.',
            '**Forgetting to await `SignOutAsync` in the validation event.** The cookie persists. Fix: return the awaited sign-out task.',
            '**Putting `[Authorize]` on `AccessDenied`.** Infinite redirect. Fix: `[AllowAnonymous]`.',
            '**Heavy database work in `OnValidatePrincipal`.** Runs on every request. Fix: keep it to a quick claim check.',
          ],
          tryIt:
            'Add the POST `Logout`, the `AccessDenied` page, and the `OnValidatePrincipal` role-claim check. Manually craft (or simulate) a cookie with no role claim, hit a protected page, and confirm you are forced back to login rather than let through.',
          takeaway: 'Logout clears the cookie (POST + anti-forgery), AccessDenied handles 403s, and session validation rejects old role-less cookies.',
        },
      ],
    },
    {
      id: 'm3-s3',
      title: 'Authorization & Roles',
      topics: [
        {
          id: 'm3-t8',
          title: 'The [Authorize] attribute and role requirements',
          explain:
            'Apply `[Authorize]` to require any logged-in user, `[Authorize(Roles = "admin,manager")]` to require specific roles, and `[AllowAnonymous]` to open a few endpoints.',
          analogy:
            'These attributes are the door signs around TunMani Resort. A plain `[Authorize]` sign means "staff wristband required". `[Authorize(Roles = "admin,manager")]` means "managers and above only". `[AllowAnonymous]` is the open lobby — the public can walk in (used for the public booking PDF link). The guard reads the wristband’s role stamp against each door’s sign automatically.',
          theory:
            'Authorization is **declarative**: you decorate controllers or actions with attributes and ASP.NET Core enforces them.\n\n- **`[Authorize]`** — any authenticated user may proceed; anonymous users are redirected to `LoginPath`.\n- **`[Authorize(Roles = "admin,manager")]`** — the user must have **at least one** of the listed roles (a comma means OR). This reads the **Role claim** in the cookie.\n- **`[Authorize(Roles = "admin")]`** — admin only.\n- **`[AllowAnonymous]`** — overrides any `[Authorize]` higher up; the endpoint is open to everyone.\n\nAttributes **cascade**: put `[Authorize]` on the controller and every action inherits it; place `[AllowAnonymous]` on a single action to punch a hole (e.g. a public PDF endpoint). A user who is authenticated but lacks the role is sent to `AccessDeniedPath`, not the login page.',
          whyItMatters:
            'This is how the whole app enforces who can do what — auditors cannot edit bookings, staff cannot manage users, and the public can fetch only their own booking PDF. Declarative attributes keep these rules visible right above each action, easy to read and audit, instead of scattered `if` checks. Understanding the OR semantics of the role list avoids accidental over- or under-permissioning.',
          steps: [
            'Put `[Authorize]` on a controller to require login app-wide.',
            'Add `[Authorize(Roles = "admin,manager")]` to a management controller.',
            'Add `[Authorize(Roles = "admin")]` to the user-management controller.',
            'Add `[AllowAnonymous]` to the public PDF action.',
            'Remember a comma-separated role list means OR.',
            'Confirm a wrong-role user is sent to `AccessDenied`, not `Login`.',
            'Optionally add a global fallback authorization policy.',
          ],
          code: `// Role-based attributes across controllers.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// Any logged-in user can view bookings...
[Authorize]
public class BookingsController : Controller
{
    public IActionResult Index() => View();           // any role

    // ...but only managers/admins can confirm one.
    [Authorize(Roles = "admin,manager")]              // OR: admin OR manager
    [HttpPost]
    public IActionResult Confirm(int id) => RedirectToAction(nameof(Index));

    // The public booking PDF is open to anyone with the token link.
    [AllowAnonymous]
    [HttpGet("/booking/public/{token}/pdf")]
    public IActionResult PublicPdf(string token) => File(/* bytes */ Array.Empty<byte>(), "application/pdf");
}

// User management is admin-only for every action.
[Authorize(Roles = "admin")]
public class UsersController : Controller
{
    public IActionResult Index() => View();
}`,
          pitfalls: [
            '**Reading the role list as AND.** `Roles = "admin,manager"` means OR, not both. Fix: remember comma = OR.',
            '**Forgetting `[AllowAnonymous]` on the public PDF.** Guests cannot open their own booking link. Fix: open just that action.',
            '**Relying on hiding buttons in the UI for security.** The endpoint is still reachable. Fix: enforce with attributes on the server.',
            '**Misspelling a role string ("Admin" vs "admin").** Checks silently fail. Fix: centralise role names in constants.',
            '**Putting `[Authorize(Roles=...)]` but no role claim in the cookie.** Always denied. Fix: ensure the callback adds the Role claim.',
            '**Expecting a wrong-role user to hit Login.** They hit AccessDenied. Fix: design for the 403 path, not the 401.',
          ],
          tryIt:
            'Decorate a `BookingsController` with `[Authorize]`, add `[Authorize(Roles = "admin,manager")]` to a Confirm action, and `[AllowAnonymous]` to a public PDF action. Log in as staff and confirm you can see the index but get AccessDenied on Confirm, while the PDF link works without logging in.',
          takeaway: '[Authorize] requires login, [Authorize(Roles=...)] requires one of the listed roles (OR), and [AllowAnonymous] opens an endpoint.',
        },
        {
          id: 'm3-t9',
          title: 'Role-based dashboard redirects',
          explain:
            'After login, send each role to the right home: admin/manager to the main dashboard, staff to the staff dashboard, auditor to the auditor area.',
          analogy:
            'When staff badge in at TunMani Resort each morning, the gate quietly directs them to their station — the manager to the operations office, the front-desk clerk to reception, the auditor to the records room. They never have to find their own way. Role-based redirect after login is that automatic routing to the right starting screen.',
          theory:
            'Different roles need different landing pages. After `SignInAsync` in the callback, you branch on the user’s role:\n\n- **admin / manager** → the main dashboard (`/Dashboard`).\n- **staff** → the staff dashboard (`/Staff`).\n- **auditor** → the auditor area (`/Audit`).\n\nA small helper, `RedirectToRoleHome(role, returnUrl)`, encapsulates this. If a safe local **`returnUrl`** is present (the user was heading somewhere specific before being asked to log in), honour it; otherwise fall back to the role’s default home.\n\nAlways validate that `returnUrl` is a **local URL** (`Url.IsLocalUrl(returnUrl)`) before redirecting to it, to prevent open-redirect attacks where an attacker crafts a link that bounces the user to an external phishing site after login.',
          whyItMatters:
            'Dropping every role onto the same generic page is clumsy and leaks options users cannot use. Role-aware redirects make the app feel tailored — staff see their counter, auditors see reports — and respecting a validated `returnUrl` means deep links keep working after a login prompt. The open-redirect check is a small but real security must-do.',
          steps: [
            'Write a `RedirectToRoleHome(string role, string? returnUrl)` helper.',
            'If `returnUrl` is set and local, redirect there.',
            'Otherwise switch on the role.',
            'admin/manager → `/Dashboard`.',
            'staff → `/Staff`.',
            'auditor → `/Audit`.',
            'Call the helper at the end of `ExternalLoginCallback`.',
          ],
          code: `// Role-based redirect after a successful sign-in.
private IActionResult RedirectToRoleHome(string role, string? returnUrl)
{
    // Honour a SAFE local return URL first (open-redirect protection).
    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
        return LocalRedirect(returnUrl);

    return role switch
    {
        Roles.Admin or Roles.Manager => RedirectToAction("Index", "Dashboard"),
        Roles.Staff                  => RedirectToAction("Index", "Staff"),
        Roles.Auditor                => RedirectToAction("Index", "Audit"),
        _                            => RedirectToAction("Index", "Home"),
    };
}

// Called at the end of ExternalLoginCallback:
//   return RedirectToRoleHome(user.Role, returnUrl);`,
          pitfalls: [
            '**Redirecting to a raw `returnUrl` without checking it is local.** Open-redirect / phishing. Fix: `Url.IsLocalUrl(returnUrl)` first.',
            '**One dashboard for all roles.** Users see controls they cannot use. Fix: branch by role.',
            '**Hard-coding role strings in the switch.** Typos slip through. Fix: use the `Roles` constants.',
            '**No default case.** An unexpected role lands nowhere. Fix: fall back to a safe home.',
            '**Doing the redirect before signing in.** No cookie yet. Fix: redirect after `SignInAsync`.',
            '**Putting redirect logic in the view.** Hard to test. Fix: keep it in the controller helper.',
          ],
          tryIt:
            'Write `RedirectToRoleHome` and call it from the callback. Log in as users with different roles and confirm admin/manager land on the dashboard, staff on the staff page, and auditor on the audit page. Then visit a protected URL while logged out and confirm you return to it after login (and that an external returnUrl is rejected).',
          takeaway: 'After sign-in, redirect by role (admin/manager→dashboard, staff→staff, auditor→audit), honouring only a validated local returnUrl.',
        },
        {
          id: 'm3-t10',
          title: 'The user management screen (admin only)',
          explain:
            'Admins use a Users screen to add staff by email, assign roles, and deactivate users (IsActive = false) — all behind `[Authorize(Roles = "admin")]`.',
          analogy:
            'The TunMani Resort owner keeps the master staff register and is the only one allowed to write in it: adding a new clerk, promoting someone to manager, or marking a departed employee inactive. The user-management screen is that locked register, and `[Authorize(Roles = "admin")]` is the lock only the owner’s key opens.',
          theory:
            'New staff cannot self-assign roles, so an **admin-only `UsersController`** manages the `app_users` table. Decorated with **`[Authorize(Roles = "admin")]`** at the class level, every action requires the admin role.\n\nIt offers: **list** all users, **add** a user by email with a chosen role (so they can log in via Google and immediately have the right access), **change** a user’s role, and **deactivate** a user by setting **`IsActive = false`** (preserving their history while blocking login — recall the callback rejects inactive users).\n\nEvery state-changing action (add, change role, deactivate) is a POST guarded by **`[ValidateAntiForgeryToken]`**. The screen reads and writes through the `IAppUserRepository`, keeping the controller thin.',
          whyItMatters:
            'Roles are only useful if someone can assign them safely. A locked-down admin screen is how the resort onboards a new manager, promotes a clerk, or revokes access when someone leaves — without touching the database directly. Restricting it to admins (and CSRF-protecting every change) prevents privilege escalation, the most damaging class of auth bug.',
          steps: [
            'Create a `UsersController` with `[Authorize(Roles = "admin")]` on the class.',
            'Add an `Index` action listing all `AppUser`s.',
            'Add a POST `Create(email, role)` action that adds a user.',
            'Add a POST `SetRole(id, role)` action.',
            'Add a POST `Deactivate(id)` action setting `IsActive = false`.',
            'Guard every POST with `[ValidateAntiForgeryToken]`.',
            'Use `IAppUserRepository` for all data access.',
          ],
          code: `// Controllers/UsersController.cs — admin-only user management.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = Roles.Admin)]                 // whole controller is admin-only
public class UsersController : Controller
{
    private readonly IAppUserRepository _users;
    public UsersController(IAppUserRepository users) => _users = users;

    public async Task<IActionResult> Index()
        => View(await _users.GetAllAsync());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(string email, string role)
    {
        await _users.CreateAsync(new AppUser
        {
            Email = email.Trim().ToLowerInvariant(),
            Name  = email,
            Role  = role,                         // admin assigns the role
            IsActive = true,
        });
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SetRole(int id, string role)
    {
        await _users.SetRoleAsync(id, role);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Deactivate(int id)
    {
        await _users.SetActiveAsync(id, false);   // soft-disable, keep history
        return RedirectToAction(nameof(Index));
    }
}`,
          pitfalls: [
            '**Forgetting `[Authorize(Roles = "admin")]` on the controller.** Any user could manage roles. Fix: lock the whole controller to admin.',
            '**Letting an admin deactivate themselves and lock everyone out.** Fix: prevent self-deactivation / keep at least one active admin.',
            '**No anti-forgery token on the POSTs.** CSRF can create admins. Fix: `[ValidateAntiForgeryToken]` on every change.',
            '**Hard-deleting users.** Orphans their booking/audit trail. Fix: deactivate with `IsActive = false`.',
            '**Storing emails with mixed casing.** Duplicate-looking users, failed lookups. Fix: normalise to lowercase.',
            '**Accepting an arbitrary role string from the form.** Typos or invalid roles. Fix: validate against the known `Roles` set.',
          ],
          tryIt:
            'Build the admin-only `UsersController` with Index, Create, SetRole, and Deactivate. As an admin, add a new user with the manager role, then deactivate them. Confirm a non-admin gets AccessDenied on the whole controller and that the deactivated user can no longer log in.',
          takeaway: 'An [Authorize(Roles="admin")] Users screen adds users, assigns roles, and deactivates with IsActive=false — every change CSRF-protected.',
        },
        {
          id: 'm3-t11',
          title: 'CSRF protection & Data Protection key persistence',
          explain:
            'Use `[ValidateAntiForgeryToken]` to block cross-site request forgery, and persist Data Protection keys so cookies survive app restarts and scale across servers.',
          analogy:
            'CSRF protection is the TunMani Resort rule that any instruction to change the register must carry today’s secret stamp that only the real form hands out — a forged note from outside has no stamp and is refused. Data Protection keys are the master stamp itself: if the resort reprints a brand-new stamp every time the office reopens, yesterday’s valid wristbands suddenly look fake. Persisting the keys means the same stamp survives restarts, so wristbands keep working.',
          theory:
            '**CSRF (Cross-Site Request Forgery)** tricks a logged-in user’s browser into submitting a state-changing request to your app from a malicious page. The defence is the **anti-forgery token**: Razor forms emit a hidden token, and **`[ValidateAntiForgeryToken]`** on POST actions rejects requests without a matching one. Apply it to every state-changing action (login’s `ExternalLogin`, logout, user management).\n\n**Data Protection** is the subsystem that encrypts the auth cookie and anti-forgery tokens. By default the encryption **keys live in memory**, so a restart (or a second server) invalidates every existing cookie — users get logged out. The fix is to **persist the keys** to a shared, stable location: a folder, a database, or a cloud key store, via `services.AddDataProtection().PersistKeysToFileSystem(...)` (or a Postgres/Redis provider).\n\nTogether these make sessions both **safe** (no forged requests) and **durable** (cookies survive restarts and work across all servers behind a load balancer).',
          whyItMatters:
            'Without anti-forgery tokens, an attacker could create an admin or log staff out from a malicious page. Without persisted Data Protection keys, every deploy logs everyone out and a multi-server setup randomly rejects cookies. For a production TunMani Resort deployment, both are non-negotiable — they are exactly the issues that surface only once the app is live.',
          steps: [
            'Add `[ValidateAntiForgeryToken]` to every POST that changes state.',
            'Ensure Razor forms render the hidden anti-forgery field (they do by default).',
            'Call `builder.Services.AddDataProtection()` in `Program.cs`.',
            'Persist keys with `.PersistKeysToFileSystem(...)` or a database/Redis provider.',
            'Point all servers at the same shared key location.',
            'Optionally protect the keys at rest.',
            'Deploy, restart, and confirm existing logins survive.',
          ],
          code: `// 1. CSRF: guard state-changing POSTs (shown earlier on Logout, Users).
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> SetRole(int id, string role) { /* ... */ return Ok(); }

// Razor automatically emits the hidden token inside a <form asp-action="...">.
// For AJAX, send the token header explicitly.

// 2. Data Protection: persist keys so cookies survive restarts & scale out.
using Microsoft.AspNetCore.DataProtection;

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(
        new DirectoryInfo("/var/tunmani/dp-keys"))   // shared, stable folder
    .SetApplicationName("TunManiResort");            // same name on every server

// In a multi-server / containerised deploy, point this at a SHARED location
// (a mounted volume, a database table, or Redis) so all instances agree on
// the keys. Without this, each restart invalidates every existing cookie.`,
          pitfalls: [
            '**No `[ValidateAntiForgeryToken]` on state-changing POSTs.** CSRF can perform admin actions. Fix: add it to every change.',
            '**Keys kept in memory in production.** Every restart logs everyone out. Fix: persist them to a shared store.',
            '**Different key locations per server.** Cookies issued by one server are rejected by another. Fix: one shared key location + same `SetApplicationName`.',
            '**Anti-forgery on GET actions.** GETs should not change state anyway. Fix: keep state changes in POSTs and token them.',
            '**Forgetting the token header in AJAX POSTs.** They fail validation. Fix: send the `RequestVerificationToken` header.',
            '**Storing keys unprotected in a public path.** Anyone reading them can forge cookies. Fix: restrict access / protect at rest.',
          ],
          tryIt:
            'Add `[ValidateAntiForgeryToken]` to your user-management POSTs and configure `AddDataProtection().PersistKeysToFileSystem(...)`. Log in, restart the app, and confirm you stay logged in (keys persisted). Then submit a POST without the token and confirm it is rejected.',
          takeaway: 'Anti-forgery tokens block CSRF on every state change, and persisted Data Protection keys keep cookies valid across restarts and servers.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Project',
      title: 'Wire Google Login End-to-End with Auto-Created AppUsers',
      domain: 'ASP.NET Core / Authentication',
      duration: '2.5 hours',
      description:
        'Configure cookie + Google authentication, build the full AccountController login flow that auto-creates an AppUser with a role and issues a role-bearing cookie, then redirect by role.',
      tools: ['ASP.NET Core 8', 'C#', 'Google OAuth', 'PostgreSQL', 'Dapper'],
      blueprint: {
        overview:
          'Take the TunMani Resort app from no auth to a working Google sign-in: an 8-hour sliding cookie, conditional Google provider, an AppUser register, and an AccountController that finds-or-creates the user, signs them in with a Role claim, and redirects them to the right dashboard.',
        functionalRequirements: [
          '**Cookie scheme.** 8-hour sliding expiration with LoginPath, LogoutPath, AccessDeniedPath.',
          '**Google provider.** AddGoogle registered conditionally from configuration.',
          '**AppUser register.** Entity + app_users table + IAppUserRepository (GetByEmail, Create).',
          '**Login flow.** Login, ExternalLogin (challenge), ExternalLoginCallback (find/create + sign-in).',
          '**Role claim.** The issued cookie carries ClaimTypes.Role from the AppUser.',
          '**Role redirect.** admin/manager→dashboard, staff→staff, auditor→audit, with a validated returnUrl.',
        ],
        technicalImplementation: [
          '**Conditional Google.** Register only if ClientId/ClientSecret are configured.',
          '**Secrets.** ClientId/ClientSecret in user-secrets; /signin-google redirect URI registered in Google Cloud Console.',
          '**Auto-create.** New emails become AppUser rows with the default staff role.',
          '**Sign-in.** SignInAsync with a ClaimsPrincipal containing email, name, and role.',
          '**Open-redirect safety.** Url.IsLocalUrl on returnUrl before LocalRedirect.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Auth config + AppUser',
            outcome: 'Cookie + conditional Google auth and the AppUser register.',
            prompt:
              "In an ASP.NET Core MVC project TunManiResort, configure authentication in Program.cs: AddAuthentication with the cookie scheme as default, AddCookie with ExpireTimeSpan 8 hours, SlidingExpiration true, LoginPath \"/Account/Login\", LogoutPath, and AccessDeniedPath \"/Account/AccessDenied\". Then conditionally AddGoogle reading Authentication:Google:ClientId and ClientSecret from configuration (only if both are set). Add app.UseAuthentication() before app.UseAuthorization(). Also create Domain/Entities/AppUser (Id, Email, Name, Role, IsActive, CreatedAt), a Roles constants class (admin, manager, staff, auditor), the app_users SQL table with a unique email, and an IAppUserRepository (GetByEmailAsync, CreateAsync) with a Dapper implementation.",
          },
          {
            step: 2,
            label: 'AccountController login flow',
            outcome: 'Login, ExternalLogin challenge, and the find/create + sign-in callback.',
            prompt:
              "Create an AccountController with: an [AllowAnonymous] Login(returnUrl) GET returning a view with a 'Sign in with Google' button; an [AllowAnonymous] POST ExternalLogin(returnUrl) that returns Challenge(properties, GoogleDefaults.AuthenticationScheme) with RedirectUri pointing at ExternalLoginCallback; and ExternalLoginCallback(returnUrl) that authenticates the Google result, reads ClaimTypes.Email, looks up the AppUser by email (auto-creating one with role staff if absent), blocks inactive users (redirect to AccessDenied), then issues a cookie via SignInAsync with claims including ClaimTypes.Role from the AppUser. Use the IAppUserRepository. Show all actions.",
          },
          {
            step: 3,
            label: 'Logout, role redirect & session validation',
            outcome: 'POST logout, role-based redirect, and rejection of role-less cookies.',
            prompt:
              "Add a [HttpPost][ValidateAntiForgeryToken] Logout that SignOutAsync the cookie and redirects to Login, plus an [AllowAnonymous] AccessDenied view. Add a RedirectToRoleHome(role, returnUrl) helper: honour returnUrl only when Url.IsLocalUrl is true, else admin/manager→Dashboard, staff→Staff, auditor→Audit; call it at the end of ExternalLoginCallback. Finally, in the cookie options add an OnValidatePrincipal event that RejectPrincipal()s and signs out any cookie lacking a ClaimTypes.Role claim, so old sessions are forced to re-login.",
          },
        ],
      },
    },
    {
      id: 'm3-p2',
      type: 'Mini Project',
      title: 'Lock Down Controllers & Build the Admin User Manager',
      domain: 'ASP.NET Core / Authorization',
      duration: '2 hours',
      description:
        'Apply role-based [Authorize] rules across the app’s controllers, open the public PDF endpoint with [AllowAnonymous], and build the admin-only Users screen to add, re-role, and deactivate users.',
      tools: ['ASP.NET Core 8', 'C#', 'PostgreSQL'],
      blueprint: {
        overview:
          'Enforce the role model: protect controllers with [Authorize] and [Authorize(Roles=...)], leave the public booking PDF open with [AllowAnonymous], and add an admin-only UsersController to manage the app_users register — every change CSRF-protected.',
        functionalRequirements: [
          '**Authenticated app.** Most controllers require login via [Authorize].',
          '**Manager actions.** Booking confirm/cancel restricted to admin,manager.',
          '**Admin-only.** UsersController locked to the admin role.',
          '**Public endpoint.** The booking PDF action is [AllowAnonymous].',
          '**User manager.** List, Create(email, role), SetRole, Deactivate (IsActive=false).',
          '**CSRF.** Every state-changing POST uses [ValidateAntiForgeryToken].',
        ],
        technicalImplementation: [
          '**Cascading attributes.** [Authorize] on controllers, [AllowAnonymous] to punch holes.',
          '**OR roles.** Roles = "admin,manager" means either role.',
          '**Soft-disable.** Deactivate sets IsActive=false; the callback already blocks inactive users.',
          '**Repository.** IAppUserRepository gains GetAll, SetRole, SetActive.',
          '**Data Protection.** Keys persisted so cookies survive restarts.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Role-based lockdown',
            outcome: 'Controllers protected by role, public PDF left open.',
            prompt:
              "Across the TunManiResort controllers, apply authorization: put [Authorize] on the controllers that need any logged-in user, [Authorize(Roles = \"admin,manager\")] on booking confirm/cancel actions, [Authorize(Roles = \"admin\")] on the user-management controller, and [AllowAnonymous] on the public booking PDF action (route /booking/public/{token}/pdf). Explain that a comma-separated Roles list means OR and that a wrong-role user is sent to AccessDeniedPath, not Login. Show the attribute placement on each controller.",
          },
          {
            step: 2,
            label: 'Admin user manager',
            outcome: 'An admin-only Users screen to add, re-role, and deactivate users.',
            prompt:
              "Create an [Authorize(Roles = \"admin\")] UsersController using IAppUserRepository (add GetAllAsync, SetRoleAsync, SetActiveAsync). Actions: Index (list all users); [HttpPost][ValidateAntiForgeryToken] Create(string email, string role) that normalises the email to lowercase and adds an active AppUser with that role; [HttpPost][ValidateAntiForgeryToken] SetRole(int id, string role); and [HttpPost][ValidateAntiForgeryToken] Deactivate(int id) that sets IsActive=false. Validate the submitted role against the known Roles set, and prevent an admin from deactivating the last active admin. Include a simple Razor Index view with an anti-forgery-tokened form.",
          },
          {
            step: 3,
            label: 'CSRF + Data Protection',
            outcome: 'Durable, CSRF-safe sessions across restarts.',
            prompt:
              "Confirm every state-changing POST in the app uses [ValidateAntiForgeryToken] and that Razor forms emit the hidden token. Then configure Data Protection in Program.cs: AddDataProtection().PersistKeysToFileSystem(a shared folder).SetApplicationName(\"TunManiResort\"), and explain why persisting keys keeps the auth cookie valid across app restarts and multiple servers. Describe how to verify it by restarting the app and confirming you stay logged in.",
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'In Program.cs, why must app.UseAuthentication() come before app.UseAuthorization()?',
      options: [
        'Alphabetical order',
        'So the identity (from the cookie) is built before access is checked; otherwise every request looks anonymous',
        'To make the app start faster',
        'They can be in any order',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'Where should the Google ClientId and ClientSecret be stored in development?',
      options: [
        'Hard-coded in Program.cs',
        'Committed in appsettings.json',
        'In user-secrets (outside source control), read from configuration',
        'In a public README',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: 'After Google returns in ExternalLoginCallback, where does the user’s ROLE come from?',
      options: [
        'From a Google claim',
        'From the app’s own AppUser record (the database is the source of truth)',
        'It is always admin',
        'From the returnUrl',
      ],
      answer: 1,
    },
    {
      id: 'm3-q4',
      q: 'What does [Authorize(Roles = "admin,manager")] require?',
      options: [
        'The user must have BOTH the admin and manager roles',
        'The user must have at least ONE of admin or manager (comma means OR)',
        'Any logged-in user',
        'No login at all',
      ],
      answer: 1,
    },
    {
      id: 'm3-q5',
      q: 'Why is the public booking PDF endpoint marked [AllowAnonymous]?',
      options: [
        'To make it load faster',
        'So a guest can open their booking PDF via the token link without logging in, even though the rest of the app requires auth',
        'Because PDFs cannot be secured',
        'To disable HTTPS for it',
      ],
      answer: 1,
    },
    {
      id: 'm3-q6',
      q: 'Why must Data Protection keys be persisted (not kept in memory) in production?',
      options: [
        'To reduce CPU usage',
        'So the auth cookie stays valid across app restarts and across multiple servers; in-memory keys are lost on restart and differ per server',
        'To make Google login optional',
        'To enable sliding expiration',
      ],
      answer: 1,
    },
  ],
}

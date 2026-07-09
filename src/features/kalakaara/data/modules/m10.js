// Module 11 — The Contact System: Where Login Finally Matters
// KalaKaara (React + Supabase) course content for the React course player.

export const m10 = {
  id: 'm10',
  title: 'The Contact System — Where Login Finally Matters',
  hours: 5,
  color: 'from-lime-500/20 to-lime-700/10',
  accent: 'lime',
  description:
    'The whole app has been public-read until now. This module closes the loop: it withholds an artist\'s phone number inside Postgres itself, makes Google sign-in an invisible detour that returns the user to exactly what they asked for, and turns a revealed number into a one-tap WhatsApp message. Every hard part is about doing the right thing in the database and the browser storage layer — not in React state.',
  sections: [
    {
      id: 'm10-s1',
      title: 'Hiding a column is a database problem, not a React problem',
      topics: [
        {
          id: 'm10-t1',
          title: 'Three ways to hide a phone number, and how each one leaks',
          explain:
            'The obvious ways to hide a contact number all leak, because they hide the value after it has already reached the browser.',
          analogy:
            'Picture the seva counter at Kollur temple handing you a sealed prasada packet, then telling you not to look inside until you get home. The packet is already in your hand — nothing stops you opening it in the queue. Hiding a phone number in React is the same: the number is already in the packet the server handed over. The only real fix is for the counter to not put it in the packet in the first place.',
          theory:
            'A logged-out visitor must not be able to obtain an artist\'s phone number. There are three tempting ways to build this, and all three fail, because all three let the number reach the browser and then try to hide it there.\n\n**Naive attempt 1 — hide it with CSS.** You render `<span className="phone hidden">{artist.phone}</span>` and set `.hidden { display: none }`. The number is invisible on screen. It is also sitting in the DOM. Right-click, Inspect, expand the element, and there it is in plain text. `display:none` changes what is painted, not what exists. The value travelled from Postgres, across the network, into the React tree, and into the document. You hid the last inch of a journey it should never have started.\n\n**Naive attempt 2 — filter it in the service layer.** You fetch the artist with `select(\'*\')`, then in `artistService.js` you do `if (!user) delete row.phone` before returning. Cleaner, and the DOM is now clean too. But open the Network tab and click the request: the raw JSON response from PostgREST still contains `"phone": "+91 98..."`. Your JavaScript deleted it *after* the wire delivered it. Anyone reading the response body — which is one click away in DevTools, or one `curl` with the anon key — reads the number.\n\n**Naive attempt 3 — guard the render with `if (user)`.** You write `{user && <Phone value={artist.phone} />}`. No user, no `<Phone>` component, nothing painted, nothing in the DOM for that element. Better than the first two. And still leaking, for the same reason as the second: `artist.phone` only has a value to guard because the row *arrived* with a phone field. The gate is on the render, not on the data. The data is already in memory, already in the network response, already reachable.\n\nThe pattern behind all three failures is one sentence: **you cannot hide, in the browser, a value the server chose to send.** The browser is the adversary\'s machine. DevTools, `curl`, a proxy, a saved HAR file — the response body is theirs. The only implementation that actually works is the one where the phone number **never leaves Postgres** unless the caller is entitled to it. That is not a React problem. It is a database problem, and the rest of this section solves it in the database.',
          whyItMatters:
            'This is the single most common security mistake in beginner marketplace apps, and interviewers probe for it directly. "How do you hide the phone number from logged-out users?" has exactly one correct answer — the database withholds it — and three wrong answers that a candidate will confidently offer. Knowing why CSS, service-layer filtering, and render guards all leak is what separates someone who understands the client/server trust boundary from someone who does not.',
          steps: [
            'Build the naive CSS version once, deliberately, on a throwaway branch. Then open Inspect and read the number out of the DOM. Feel it.',
            'Now try the service-layer delete. Open the Network tab, click the artists request, and read the number out of the raw response body. Feel that too.',
            'Write the one-sentence rule on a card: **a value the server sends can never be hidden by the client.**',
            'Conclude that the fix must live where the data originates — in Postgres — not anywhere in React.',
            'Note that this same reasoning applies to any sensitive field later: a private email, an exact address, a payout account. The lesson generalises.',
          ],
          code: `// ALL THREE OF THESE LEAK. Do not ship any of them.

// LEAK 1 — hidden with CSS. The number is in the DOM; Inspect reveals it.
function ContactCss({ artist }) {
  return <span className="phone-hidden">{artist.phone}</span>;
}
// .phone-hidden { display: none }  <- paints nothing, hides nothing.

// LEAK 2 — filtered in the service. The Network response still carried it.
export async function getArtist(slug, user) {
  const { data } = await supabase.from('artists').select('*').eq('slug', slug).single();
  if (!user) delete data.phone;   // too late: the wire already delivered "phone"
  return data;                    // open the Network tab and read the raw body
}

// LEAK 3 — guarded render. artist.phone only exists because the row arrived with it.
function ContactGuard({ artist, user }) {
  return user ? <a href={\`tel:\${artist.phone}\`}>{artist.phone}</a> : <SignInButton />;
  //            ^ the value is in memory regardless of this ternary
}

// The only correct shape (built across the rest of this section):
// the SELECT that browse and detail run cannot return phone AT ALL,
// and the number comes only from an authenticated RPC. Postgres withholds it.`,
          pitfalls: [
            '**Believing `display:none` removes data.** It removes paint, not presence. Fix: never rely on CSS for anything a user must not obtain — CSS is a presentation layer, not a security boundary.',
            '**Trusting the Network tab is "developer-only".** Any visitor can open it, and any script can replay the request with the public anon key. Fix: treat every response body as public to the caller who received it.',
            '**Filtering sensitive fields in JavaScript after fetching `select(\'*\')`.** The wire already carried them. Fix: never `select(\'*\')` on a table with sensitive columns from a public caller — select an explicit safe column list, or read a view that lacks the columns.',
            '**Assuming a render guard protects data.** It protects pixels. The bound value is in the component\'s props and the network trace regardless. Fix: gate the *fetch*, in the database, not the render.',
            '**Testing "logged out" by logging out in the UI but keeping the same query.** The query still returns the column; you just stopped painting it. Fix: verify against the raw network body, not the screen.',
          ],
          tryIt:
            'Take any of the three leaking versions. Without changing a line of it, extract the phone number as a logged-out user, and write down which tool you used (Inspect for CSS/guard, the Network tab for the service filter). If you can do it in under thirty seconds, you have proven why the fix must be in Postgres.',
          takeaway:
            'CSS hiding, service-layer filtering, and render guards all leak, because each hides a value the server already sent. The only fix is to never send it — a database problem, not a React one.',
        },
        {
          id: 'm10-t2',
          title: 'Why RLS alone cannot hide a column — rows versus columns',
          explain:
            'Row Level Security filters which rows come back, but it cannot null out one column of a row it does let through — so column hiding needs a different tool.',
          analogy:
            'RLS is the temple gatekeeper who decides *which people* may enter the sanctum — a whole-person, in-or-out decision. What you need here is different: everyone may see the artist\'s row, but only some may see one *field* on it, the phone number. That is not "who enters" — it is "which line of the register you may read." The gatekeeper has no power over individual lines. You need a different mechanism: a second register that simply omits that line.',
          theory:
            'You have used RLS since Module 4, and your instinct will be to reach for it here. It is the right instinct for the wrong shape of problem. **RLS filters rows.** A `select` policy is a boolean expression evaluated per row: if it returns true, the whole row is returned; if false, the row is invisible, as if it did not exist. There is no in-between. A policy cannot say "return this row, but replace `phone` with NULL for anonymous callers." Policies operate on rows, and a column is not a row.\n\nSo if the artist row must be visible to everyone — and it must, because logged-out visitors browse profiles — then RLS will hand back the *entire* row, phone included. RLS is simply the wrong layer for column-level withholding. Postgres does have real tools for this, three of them, and you should know all three and choose honestly.\n\n**Option (a): column privileges — `GRANT`/`REVOKE`.** Postgres can grant `SELECT` on specific columns to a role. `revoke select (phone, whatsapp) on artists from anon` means the `anon` role literally cannot read those two columns; a `select *` by an anonymous caller errors or omits them. This is precise and enforced by the engine. The catch: it interacts awkwardly with PostgREST\'s `select=*` (which expands to every column the role *can* see, so behaviour gets subtle), and column grants are easy to forget when you add a column later. Powerful, but fiddly to operate.\n\n**Option (b): a public view.** Create `artists_public` as a view that selects every column *except* `phone` and `whatsapp`. Grant the view to `anon` and `authenticated`; lock the base `artists` table down so public roles cannot read it directly. Now browse and artist-detail read the view, and the two contact columns are simply not in the shape they receive — there is no column to leak. Views are easy to read, easy to reason about, and the "safe shape" is written down in one place.\n\n**Option (c): a `security definer` RPC.** Write a function `get_artist_contact(slug)` that returns the phone and whatsapp *only when* `auth.uid() is not null`. Because it runs `security definer`, it executes with the privileges of its owner (which can read the base table) rather than the caller — so the caller never needs direct access to `artists.phone` at all. The function itself enforces the "must be signed in" rule in its `where` clause.\n\nThe design KalaKaara ships is **(b) + (c) together**: the view gives everyone a safe artist shape with no contact columns, and the RPC is the single narrow, authenticated door through which a real phone number can ever come. Option (a) is left as a defence-in-depth note. Two mechanisms, each simple, composing into a gate with no gap.',
          diagram: `graph TD
    subgraph RLS[What RLS can do: filter ROWS]
      R1[artist row 1 ✓ visible]
      R2[artist row 2 ✗ hidden]
      R3[artist row 3 ✓ visible]
    end
    subgraph NEED[What we need: hide a COLUMN]
      C[artist row 1<br/>name ✓  bio ✓  city ✓<br/>phone ✗  whatsapp ✗]
    end
    RLS -. cannot express .-> NEED
    NEED --> V[View: artists_public<br/>omits phone/whatsapp]
    NEED --> RPC[RPC: get_artist_contact<br/>returns phone only if signed in]
    V --> SAFE[Everyone reads a safe shape]
    RPC --> SAFE
    style R2 fill:#fecaca
    style C fill:#fef3c7`,
          flowExplain:
            'The left box is a per-row in/out decision — all RLS can ever make. The right box needs one field of a visible row suppressed, which RLS cannot express. The view and the RPC below it are the two mechanisms that can.',
          whyItMatters:
            'Conflating "RLS secures everything" is the most common Supabase misconception after "the anon key is a password." In a real review, proposing a view or a security-definer function for column-level access — and explaining precisely why an RLS policy cannot null a column — signals that you understand what RLS actually is: a row filter, not a general-purpose access engine.',
          steps: [
            'State the distinction out loud: RLS decides which **rows** are returned; it cannot alter the **columns** of a row it returns.',
            'Enumerate the three real tools: column `GRANT`/`REVOKE`, a public view, a `security definer` RPC. Write one honest pro and con for each.',
            'Choose the combination this course ships: a view for the safe browse/detail shape, an RPC for the authenticated contact reveal.',
            'Note why you do not simply put the phone behind an RLS policy on `artists`: it would hide the whole artist row from logged-out visitors, breaking browsing.',
            'Keep column `REVOKE` in your back pocket as defence-in-depth — the base table should not be readable by `anon` at all once the view exists.',
          ],
          code: `-- WRONG INSTINCT: try to hide a column with an RLS policy. You cannot.
-- A select policy is a per-ROW boolean. It has no way to null one column.
-- create policy "hide phone" on artists for select using (???);  -- impossible

-- Option (a): column privileges. Precise, but fiddly with PostgREST select=*.
revoke select on public.artists from anon, authenticated;
grant  select (id, slug, display_name, bio, city_id, avatar_url,
               rating_avg, is_published)                     -- NOT phone/whatsapp
       on public.artists to anon, authenticated;

-- Option (b): a public view that simply does not contain the columns.
create view public.artists_public as
  select id, slug, display_name, bio, city_id, avatar_url,
         years_experience, rating_avg, review_count, is_published, created_at
  from public.artists
  where is_published = true;                 -- no phone, no whatsapp anywhere
grant select on public.artists_public to anon, authenticated;

-- Option (c): a security-definer RPC that returns contact ONLY to a signed-in caller.
-- (Full version, with the mandatory search_path pin, is built in the next topic.)

-- KalaKaara ships (b) + (c): the view is the safe shape everyone reads,
-- the RPC is the one authenticated door a real number can come through.`,
          pitfalls: [
            '**Reaching for an RLS policy to hide a column.** It filters rows, not columns; there is no policy that nulls a field. Fix: use a view (omit the column) or an RPC (return it conditionally).',
            '**Putting the phone behind a row policy on `artists`.** Then the *whole* artist row vanishes for logged-out visitors, and browsing breaks. Fix: keep the row public via a view; gate only the contact fields.',
            '**Creating the view but leaving the base table readable by `anon`.** The view is useless if `select * from artists` still works for the public role. Fix: `revoke select on artists from anon`; expose only the view.',
            '**Forgetting a view is not automatically updatable or RLS-aware the way you expect.** A plain view runs with the *definer\'s* rights unless `security_invoker` is set. Fix: for read-only public data this is fine, but know which you want, and never expose write through it.',
            '**Adding a new sensitive column later and forgetting the view.** A `select *`-style base grant would leak it. Fix: an explicit column list in the view means a new sensitive column is excluded by default — you must opt it in.',
          ],
          tryIt:
            'Write, in one sentence each, the difference between what `revoke select (phone) ... from anon` and a `create view` achieve for hiding a column. (The revoke stops the role reading that column of the base table; the view hands the role a different object that never had the column.) Which is easier to audit at a glance? Most engineers answer "the view."',
          takeaway:
            'RLS filters rows and cannot null a column. Column-level withholding needs column privileges, a view, or a security-definer RPC — KalaKaara uses a public view plus an authenticated RPC.',
        },
        {
          id: 'm10-t3',
          title: 'Building the gate: the public view and the security-definer RPC',
          explain:
            'Create a view that omits the contact columns for everyone, and a security-definer function that returns them only when the caller is signed in.',
          analogy:
            'Think of two counters at the Udupi Krishna Matha. The open counter shows everyone the day\'s seva list — names, timings, everything except the priest\'s personal number. The second, staffed counter will give you that number, but only after you have signed the register. The staffed counter has a key to the back office (it runs with the office\'s authority, not yours), but it still checks your signature before it fetches anything. That staffed counter is a `security definer` function with an `auth.uid() is not null` check.',
          theory:
            'Two objects, built in order.\n\n**The view.** `artists_public` selects every column browse and detail need and *not* `phone` or `whatsapp`. You built its skeleton in the last topic; the point to internalise is that it becomes the *only* artists object your public code reads. `useArtists`, `useArtist`, the browse grid, the detail page — all of them read `artists_public`. There is no code path in the app where a logged-out fetch can even name the `phone` column, because the object it queries does not have one.\n\n**The RPC.** Now the one narrow door. A `security definer` function runs with the privileges of the role that *owns* it (typically `postgres`), not the role that *calls* it. That is what lets it read `artists.phone` even though the `anon` and `authenticated` roles have been revoked from the base table. Power like that must be caged, and the cage is the function body: it returns rows only where `auth.uid() is not null`. A signed-in caller gets the contact; an anonymous caller matches zero rows.\n\nHere is the exact function:\n\n```\ncreate function get_artist_contact(artist_slug text)\nreturns table(phone text, whatsapp text)\nlanguage sql\nsecurity definer\nset search_path = public\nas $$\n  select phone, whatsapp from artists\n  where slug = artist_slug and auth.uid() is not null\n$$;\n```\n\nTwo details are load-bearing. First, **`set search_path = public` is mandatory, not stylistic.** A `security definer` function runs with elevated privileges, and it resolves unqualified names (`artists`, functions, operators) using the caller\'s `search_path` unless you pin it. An attacker who can set their own `search_path` — for example to a schema where they created a malicious `artists` table or a trojan operator — can make your elevated function execute *their* code with *your* privileges. This is a real, documented privilege-escalation class. Pinning `search_path` to a known schema closes it. Every `security definer` function you ever write must pin its `search_path`; treat it as part of the syntax.\n\nSecond, **the function returns zero rows for an anonymous caller rather than raising an error.** The `where` clause simply fails to match, so PostgREST returns `[]`. This is deliberate. Raising `insufficient_privilege` would (a) leak that the artist exists and has a contact, and (b) force the client to distinguish "not signed in" from "artist has no number" from "server error" — three cases with three different UI responses. Returning an empty set collapses the anonymous case into the same shape as "no contact on file": the client shows the "Show phone number" button and moves on. Silence is the correct answer to an unauthorised question.',
          diagram: `graph TD
    A[Caller: get_artist_contact 'rukmini-shetty'] --> D{security definer<br/>runs as owner, not caller}
    D --> SP[search_path pinned to public<br/>names resolve safely]
    SP --> W{auth.uid is not null?}
    W -- No, anonymous --> Z[0 rows -> PostgREST returns array]
    W -- Yes, signed in --> Q[select phone, whatsapp<br/>from artists where slug matches]
    Q --> R[1 row: the contact]
    Z --> UI1[Client shows 'Show phone number']
    R --> UI2[Client renders the number]
    style Z fill:#fef3c7
    style R fill:#dcfce7`,
          flowExplain:
            'The pinned `search_path` guards the elevated function from a hijacked name resolution; the `auth.uid()` check inside the body is what turns "runs as owner" from a hole into a gate. Anonymous callers fall down the left branch to an empty array, not an error.',
          whyItMatters:
            'Security-definer functions are the standard Supabase answer to "let the client do a privileged thing under a rule the database enforces," and the unpinned-`search_path` vulnerability is a genuine CVE-class bug that has shipped in real Postgres extensions. Being able to write one correctly — elevated, pinned, and self-gated — is a concrete, senior-level Postgres skill that comes up well beyond this course.',
          steps: [
            'Create `artists_public` as a view with an explicit safe column list; grant `select` on it to `anon` and `authenticated`.',
            'Revoke `select` on the base `artists` table from `anon` (and from `authenticated` too — even signed-in users read the view for the row; contact comes via the RPC).',
            'Create `get_artist_contact(artist_slug text)` as `language sql`, `security definer`, with `set search_path = public`.',
            'Put the whole rule in the `where` clause: `slug = artist_slug and auth.uid() is not null`. No signed-in caller, no matching row.',
            'Grant `execute` on the function to `authenticated` only — an anonymous caller cannot even invoke it, and even if they could, the `where` clause returns nothing.',
            'Call it from the service layer with `supabase.rpc(\'get_artist_contact\', { artist_slug: slug })`.',
          ],
          code: `-- 1. The safe public shape. No phone. No whatsapp. Read by all browse/detail code.
create or replace view public.artists_public as
  select id, slug, display_name, bio, city_id, taluk_id, district_id,
         avatar_url, cover_url, years_experience, price_from,
         rating_avg, review_count, is_published, created_at
  from public.artists
  where is_published = true;

revoke select on public.artists from anon, authenticated;   -- lock the base table
grant  select on public.artists_public to anon, authenticated;

-- 2. The one authenticated door. Elevated, pinned, self-gated.
create or replace function public.get_artist_contact(artist_slug text)
returns table(phone text, whatsapp text)
language sql
security definer                    -- runs as the owner, so it CAN read artists.phone
set search_path = public            -- MANDATORY: closes the search_path hijack vector
as $$
  select phone, whatsapp
  from public.artists
  where slug = artist_slug
    and auth.uid() is not null;      -- anonymous caller -> 0 rows, not an error
$$;

revoke execute on function public.get_artist_contact(text) from anon;
grant  execute on function public.get_artist_contact(text) to authenticated;

-- 3. From the service layer:
-- const { data } = await supabase.rpc('get_artist_contact', { artist_slug: slug });
-- data is [] when logged out, [{ phone, whatsapp }] when signed in.`,
          pitfalls: [
            '**Omitting `set search_path` on a `security definer` function.** An attacker who controls their `search_path` can point unqualified names at malicious objects and run code as the function\'s owner. Fix: pin `search_path` on every definer function — no exceptions.',
            '**Raising an exception for anonymous callers instead of returning zero rows.** It leaks existence and forces the client to branch on error types. Fix: let the `where` clause fail to match; return an empty set and let the UI treat it as "not revealed yet."',
            '**Leaving `select` on the base `artists` table granted to `anon`.** The view is pointless if `select phone from artists` still works. Fix: revoke the base grant; expose only the view and the RPC.',
            '**Using `security definer` without a tight `where` clause.** Elevated privileges plus no rule equals a public dump of every phone number. Fix: the body must enforce the access rule itself — here, `auth.uid() is not null`.',
            '**Granting `execute` on the function to `anon`.** Even with the `where` guard, there is no reason to; keep the attack surface minimal. Fix: grant `execute` to `authenticated` only.',
          ],
          tryIt:
            'Remove `set search_path = public` from the function and re-read the definition imagining you are an attacker who can run `set search_path = evil, public` before calling it. Describe, in two sentences, the attack. (You create `evil.artists` returning any data you like, or an `evil` operator; the elevated function resolves `artists` to your object and runs your code with the owner\'s rights.) Now put the pin back and explain why it closes the door.',
          takeaway:
            'A public view omits the contact columns for everyone; a `security definer` RPC — pinned `search_path`, `auth.uid() is not null` in the body, zero rows for anonymice — is the single authenticated door a real number ever comes through.',
        },
        {
          id: 'm10-t4',
          title: 'Verifying the gate — the step that is the lesson',
          explain:
            'Prove the number is unreachable by acting as the anonymous role in SQL and by reading the raw network body in the browser while logged out.',
          analogy:
            'A fisherman does not assume the net has no hole because he tied it carefully — he holds it up to the light and looks. Verifying the contact gate is holding the net to the light: you become the anonymous caller yourself, from two directions, and confirm the number does not fall through.',
          theory:
            'Building the gate is half the work. The half that beginners skip — and the half interviewers actually respect — is *proving* it holds. You verify from two directions, because there are two adversary vantage points: the database role, and the browser.\n\n**Direction 1 — impersonate the `anon` role in the SQL editor.** Postgres lets you assume a role for the duration of a transaction with `set local role anon`. Do it, then try every way an anonymous caller might reach the number: select from the view (the column is not there), select from the base table (permission denied — you revoked it), and call the RPC (zero rows, because `auth.uid()` is null under the `anon` role). Reset the role afterwards. If any of those three hands you a phone number, the gate has a hole and you found it before a stranger did.\n\n**Direction 2 — read the raw network body in the browser, logged out.** This is the direction that catches the leaks from t1, because it inspects the actual bytes on the wire, not the rendered screen. Open the artist page in a fresh incognito window (guaranteed logged out), open DevTools, go to the Network tab, and reload. Click every request that hit Supabase. Search each response body for the digits of the number, for `"phone"`, for `"whatsapp"`. If the string is anywhere in any response body, the gate leaks — regardless of what the screen shows. A correct gate means the number is simply absent from every byte the anonymous session received.\n\n**Why this step *is* the lesson.** The entire premise of this section — "you cannot hide in the browser what the server sent" — is only proven by looking at what the server sent. A green screen with no visible number proves nothing; you already saw in t1 that the screen can look clean while the body leaks. Verification is not a formality appended to the work. It is the work\'s only evidence. Ship the gate, then hold it to the light, from both sides, before you believe it.',
          whyItMatters:
            'A security control you did not verify is a hope, not a control. "How did you confirm the number was actually withheld?" is the natural follow-up to "how did you hide it," and "I checked the raw response body as an anonymous user" is the answer that lands. Verification against the wire — not the screen — is the professional habit this whole module is built to instil.',
          steps: [
            'In the Supabase SQL editor, run `set local role anon;` inside a transaction, then attempt to read the number three ways: the view, the base table, and the RPC.',
            'Confirm: the view lacks the column, the base table denies permission, the RPC returns zero rows. Reset with `reset role;` or by ending the transaction.',
            'Open the live artist page in an incognito window so you are certainly logged out.',
            'Open DevTools -> Network, reload, and click each Supabase request. Search every response body for the number\'s digits and for the strings `phone` and `whatsapp`.',
            'Confirm the strings appear in zero response bodies. If any appears, trace which query returned it and fix the view or the RPC.',
            'Only now sign in, tap "Show phone number", and confirm the RPC call is the *first* and *only* place the number ever appears on the wire.',
          ],
          code: `-- DIRECTION 1: become the anonymous role and try to reach the number.
begin;
  set local role anon;                                  -- act as a logged-out caller

  select * from public.artists_public
   where slug = 'rukmini-shetty';                        -- no phone column exists

  select phone from public.artists
   where slug = 'rukmini-shetty';                        -- ERROR: permission denied

  select * from public.get_artist_contact('rukmini-shetty');  -- 0 rows (auth.uid null)
rollback;                                                -- reset the role

-- DIRECTION 2 (browser, logged out, DevTools -> Network):
--   1. Incognito window -> open /artists/rukmini-shetty
--   2. Network tab -> reload -> click each request to *.supabase.co
--   3. In each response body, Ctrl-F for: the digits, "phone", "whatsapp"
--   Expected: zero matches. The number is on NO response body.
--
-- Then sign in and tap "Show phone number":
--   the FIRST time the number appears on the wire is the rpc/get_artist_contact
--   response — and only then. That single call is the whole attack surface.`,
          pitfalls: [
            '**Verifying by looking at the screen.** A clean screen proved nothing in t1. Fix: verify against the raw response body in the Network tab, which is what an attacker actually reads.',
            '**Forgetting to reset the role after `set local role anon`.** Subsequent statements in the session run as `anon` and confuse your next test. Fix: wrap it in a transaction and `rollback`, or `reset role` immediately.',
            '**Testing while a stale session is still active.** A logged-in tab reveals the number legitimately and hides the leak. Fix: use a fresh incognito window so you are provably anonymous.',
            '**Checking only the artist-detail request.** Browse, related-artist, and prefetch requests can each leak independently. Fix: inspect *every* Supabase response on the page, not just the obvious one.',
            '**Treating verification as a one-time step.** A later `select(\'*\')` or a new column can reopen the hole. Fix: keep the two-direction check as a release step whenever you touch the artists query surface.',
          ],
          tryIt:
            'Deliberately reintroduce the t1 service-layer leak (fetch the base table, delete `phone` in JS) on a branch, then run Direction 2. Confirm the number reappears in the Network body even though the screen is clean. Revert. You have now seen, with your own eyes, why the screen is not the evidence.',
          takeaway:
            'Prove the gate two ways: impersonate `anon` in SQL, and read every response body in an incognito Network tab. The number must appear on zero wires. Verification against the wire, not the screen, is the lesson.',
        },
      ],
    },
    {
      id: 'm10-s2',
      title: 'Intent: the detour that must be invisible',
      topics: [
        {
          id: 'm10-t5',
          title: 'Why OAuth destroys everything, and where intent must live',
          explain:
            'signInWithOAuth is a full-page navigation to Google and back, which wipes all React and component state — so what the user was trying to do must be saved outside React before the redirect.',
          analogy:
            'When you leave your slippers outside the temple and step in, you trust they will still be there when you return. But an OAuth redirect is not stepping inside a room — it is the building being demolished and rebuilt while you are at Google. Anything you left "in the room" (React state, scroll position, the half-open contact section) is gone. Only what you left *outside the building*, in a locker that survives demolition, comes back with you. `sessionStorage` is that locker.',
          theory:
            'Calling `supabase.auth.signInWithOAuth({ provider: \'google\' })` does not open a modal. It sets `window.location` to Google\'s consent screen. Your single-page app is torn down: the JavaScript heap is discarded, every `useState` and `useRef` resets, the component tree unmounts, the scroll position is lost, any Context is re-initialised from scratch. Then Google redirects back to your `redirectTo` URL, the page loads *fresh*, React mounts again from zero, and Supabase exchanges the auth code for a session.\n\nThe consequence is stark: **the browser tab that returns from Google has no memory of what the user was doing before they left.** They tapped "Show phone number" on Rukmini\'s profile, scrolled to the contact section — and the app that comes back knows none of that. It knows only that a session now exists. Unless you did something *before* the redirect, the best the returning app can do is dump the user on the home page, freshly logged in and completely disoriented. That is the jarring detour Module 0 warned you about.\n\nSo the design principle is a single sentence: **anything that must survive the OAuth round trip has to be persisted outside React before you redirect.** "What the user was trying to do" — reveal Rukmini\'s contact, and the fact that they were scrolled to a particular spot — is exactly that. It cannot live in state, because state does not survive. It has to be written to a store that outlives a full page navigation.\n\nThat store is browser storage — specifically `sessionStorage`, which persists across navigations within the same tab and is cleared when the tab closes (the next topic compares the alternatives). You write the intent to it, *then* redirect. On return, the freshly mounted app reads the intent back, and replays it. The round trip below shows every hop; the two that matter are the `write intent` before the redirect and the `read intent` after it.',
          diagram: `sequenceDiagram
    autonumber
    actor U as User on /artists/rukmini
    participant R as React app (instance 1)
    participant SS as sessionStorage (survives)
    participant G as Google OAuth
    participant R2 as React app (instance 2, fresh)

    U->>R: Tap "Show phone number"
    Note over R: React state holds slug, scrollY, open panel
    R->>SS: write intent {type, slug, scrollY}
    R->>G: window.location = Google consent
    Note over R: instance 1 DESTROYED — all state gone
    G-->>R2: redirect to /artists/rukmini?code=...
    Note over R2: fresh mount — state = empty, scroll = top
    R2->>SS: read intent  (still there!)
    SS-->>R2: {type:'reveal_contact', slug:'rukmini', scrollY:840}
    R2->>R2: restore scroll, replay the reveal
    R2->>SS: clear intent`,
          flowExplain:
            'Between steps 4 and 6 the React app is a different instance with empty memory. The only thing that crosses that gap is what was written to `sessionStorage` in step 3 and read back in step 8. Everything else is gone.',
          whyItMatters:
            'Every OAuth flow in every app faces this exact problem, and getting it wrong is why so many "sign in to continue" flows dump you somewhere useless. Understanding that OAuth is a full navigation — not a modal — and that state therefore cannot survive it, is foundational. It is also the reason the answer is browser storage and never React Context.',
          steps: [
            'Internalise that `signInWithOAuth` is `window.location = ...`, not a modal — the SPA is destroyed and rebuilt.',
            'List everything you lose across the redirect: `useState`, `useRef`, Context, scroll position, the component tree. All of it.',
            'Conclude that "what the user wanted" must be written somewhere that survives a full page load, *before* the redirect fires.',
            'Choose `sessionStorage` for that store (the next topic justifies it against the alternatives).',
            'Sequence it correctly: write intent, *then* redirect. A write after the redirect call never runs.',
          ],
          code: `// signInWithOAuth is a NAVIGATION. This proves it — the alert after it may
// never even fire, because the page is already leaving.
async function naiveReveal() {
  await supabase.auth.signInWithOAuth({ provider: 'google' });
  // ⚠ everything below is on borrowed time; the tab is navigating to Google
  setPhoneVisible(true);   // this state will not exist when we come back
}

// The right shape: persist the intent OUTSIDE React first, THEN redirect.
const INTENT_KEY = 'kalakaara.pendingIntent';

function revealContact(slug) {
  // 1. write what we were doing to a store that survives the round trip
  sessionStorage.setItem(INTENT_KEY, JSON.stringify({
    type: 'reveal_contact',
    slug,
    scrollY: window.scrollY,           // so we can restore the exact position
  }));
  // 2. only now hand the tab to Google
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
}
// On return, a fresh React instance reads INTENT_KEY back and replays it (t7).`,
          pitfalls: [
            '**Expecting code after `signInWithOAuth` to run.** The tab is navigating away; anything queued after it is unreliable. Fix: do all persistence *before* the call, and treat the call as the last line.',
            '**Storing the intent in `useState` or a ref.** Both are wiped by the navigation. Fix: browser storage, written before redirect.',
            '**Storing it in React Context "because Context is global".** Context lives in the JavaScript heap, which the navigation discards. Fix: Context does not survive a page load; use `sessionStorage`.',
            '**Forgetting scroll position.** Restoring the reveal but landing at the top of the page is still disorienting. Fix: capture `window.scrollY` into the intent and restore it on return.',
            '**Setting `redirectTo` to the home page.** Then the user returns to `/`, not to Rukmini. Fix: `redirectTo` should be the current path so the returning app is already on the right page.',
          ],
          tryIt:
            'Add a `console.log` immediately after `signInWithOAuth` and watch the console as you click. You will usually see the redirect happen with the log never appearing, or appearing and then vanishing with the page. That flicker is the proof that nothing after the call — and nothing in React state — can be relied on to survive.',
          takeaway:
            'OAuth is a full page navigation that destroys React entirely. Whatever the user was trying to do must be written to `sessionStorage` *before* the redirect, and replayed by the fresh app on return.',
        },
        {
          id: 'm10-t6',
          title: 'Three places to persist intent, honestly compared',
          explain:
            'sessionStorage survives the redirect and is per-tab; a validated redirectTo path survives and is shareable; React state does not survive at all.',
          analogy:
            'You are about to cross the river by boat and must send two things to the far bank: what you intend to do there, and which jetty to land at. The "what" you seal in a waterproof box you carry yourself — private, tied to your crossing (`sessionStorage`). The "where" you can shout to the boatman, but anyone on the bank can hear and redirect you to the wrong jetty unless the boatman only accepts jetty names from an approved list (the `redirectTo` allowlist). And a note held in your open hand (React state) simply blows into the water mid-river.',
          theory:
            'Three candidate stores, judged on one question: does the value survive a full page navigation to Google and back?\n\n**`sessionStorage` — survives, per-tab, correct for the action.** It persists across navigations within the same tab and clears when the tab closes. Per-tab is exactly right: if the user has Rukmini open in one tab and Ganesh in another, each tab\'s intent stays with its own crossing — they do not collide the way `localStorage` (shared across all tabs) would. This is where the *action* goes: `{ type: \'reveal_contact\', slug, scrollY }`.\n\n**A `?next=` / `redirectTo` path — survives, shareable, and dangerous if unvalidated.** The OAuth `redirectTo` URL, and any `?next=/artists/rukmini` you append to it, comes back with the user because it is part of the URL Google returns to. It is good for the *path* — which page to land on. But it is attacker-controllable, because URLs are shareable and forgeable. If you blindly `navigate(params.get(\'next\'))`, an attacker sends a victim a link like `...?next=https://evil.example/phish`, the victim signs in trusting your domain, and your own code redirects them to the phishing site with a fresh, valid session feel. That is an **open redirect**, a real and common vulnerability. The fix is an **allowlist**: only accept `next` values that are relative paths beginning with a single `/` and matching a known route shape — never an absolute URL, never `//host`, never a scheme. Validate, then navigate.\n\n**React state or Context — does NOT survive.** It lives in the JavaScript heap, which the navigation discards. It is not a candidate for anything that must cross the redirect, full stop. Beginners reach for it because it feels like "the app\'s memory," but the app is destroyed.\n\nThe shipped design splits the job: **`sessionStorage` holds the action** (what to replay, and the scroll position), and **`redirectTo` holds the path** (which page to come back to), validated against an allowlist before it is ever used to navigate. Two stores, each doing the part it is suited for, and the one that is attacker-reachable is the one you validate.',
          diagram: `graph TD
    Q{Must it survive a full<br/>page navigation?}
    Q --> C[React state / Context]
    C --> CN[NO — heap is discarded<br/>never use for intent]
    Q --> S[sessionStorage]
    S --> SY[YES, per-tab, private<br/>-> holds the ACTION]
    Q --> N[redirectTo / ?next= path]
    N --> NY[YES, in the URL, but SHAREABLE]
    NY --> V{Validate against allowlist?}
    V -- No --> OPEN[OPEN REDIRECT<br/>attacker sends victim to phish]
    V -- Yes: relative path, single leading slash --> NP[Safe -> holds the PATH]
    style CN fill:#fecaca
    style OPEN fill:#fecaca
    style SY fill:#dcfce7
    style NP fill:#dcfce7`,
          flowExplain:
            'React state fails the first question outright. `redirectTo` passes it but opens a second risk — the open redirect — which the allowlist closes. `sessionStorage` passes cleanly and privately, which is why the action lives there.',
          whyItMatters:
            'Open redirect is on every web-security checklist (it is in the OWASP top-of-mind list for a reason) and it is exactly the kind of subtle bug that ships when someone naively reads a `next` param and calls `navigate()` on it. Being able to explain *why* you validate the redirect path, and why the action goes in per-tab storage rather than shared storage or Context, is a direct signal of security literacy.',
          steps: [
            'Write the deciding question on a card: **does this value survive a full page navigation?**',
            'Rule out React state and Context immediately — they do not survive; they are never candidates for redirect-crossing data.',
            'Use `sessionStorage` (not `localStorage`) for the action, so two open tabs keep separate intents and the intent dies with the tab.',
            'Use `redirectTo` for the path, and build an `isSafeNext()` allowlist: accept only strings starting with a single `/`, reject `//`, reject any `:` (scheme), reject absolute URLs.',
            'Never pass a raw `next` value into `navigate()`. Validate first; fall back to a safe default like `/` if it fails.',
          ],
          code: `// The ACTION goes in sessionStorage (per-tab, survives, private).
const INTENT_KEY = 'kalakaara.pendingIntent';

// The PATH goes in redirectTo — but any next= must be validated first.
// Open-redirect guard: only same-origin RELATIVE paths are allowed.
export function isSafeNext(next) {
  if (typeof next !== 'string' || next.length === 0) return false;
  if (!next.startsWith('/')) return false;   // must be relative
  if (next.startsWith('//')) return false;   // //evil.com is protocol-relative!
  if (next.includes('://')) return false;    // no absolute URLs
  if (/[\\u0000-\\u001f]/.test(next)) return false; // no control chars / newlines
  return true;
}

// Usage on return from OAuth:
const raw = new URLSearchParams(window.location.search).get('next');
const dest = isSafeNext(raw) ? raw : '/';    // fall back to a safe default
navigate(dest);                              // never navigate(raw) directly

// Why NOT localStorage for the action: it is shared across every tab.
//   Tab A revealing Rukmini and Tab B revealing Ganesh would overwrite each
//   other. sessionStorage keeps each crossing tied to its own tab.
// Why NOT Context: the page reload discards the heap. Context is gone.`,
          pitfalls: [
            '**Calling `navigate(params.get(\'next\'))` without validation.** An attacker crafts `?next=https://evil.example`, the victim signs in on your trusted domain, and you redirect them to the phish. Fix: an allowlist that accepts only relative paths with a single leading slash.',
            '**Allowing `//evil.com` because it "starts with a slash".** Protocol-relative URLs bypass a naive `startsWith(\'/\')` check and resolve to another host. Fix: explicitly reject `//` and any string containing `://`.',
            '**Using `localStorage` for the intent.** It is shared across all tabs, so concurrent reveals collide, and it outlives the tab so a stale intent can re-fire days later. Fix: `sessionStorage` — per-tab, tab-lifetime.',
            '**Storing the action in Context to "keep it in React".** The navigation discards the heap; Context is empty on return. Fix: browser storage for anything crossing the redirect.',
            '**Putting sensitive data in the `next` param.** URLs are logged, shared, and visible. Fix: `next` carries only a path; the action and any detail live in `sessionStorage`.',
          ],
          tryIt:
            'Write three `next` values your `isSafeNext` must reject and one it must accept: reject `https://evil.example`, `//evil.example`, `/\\nSet-Cookie: x`; accept `/artists/rukmini-shetty`. Run them through the function. If any malicious one passes, tighten the guard before you rely on it.',
          takeaway:
            'sessionStorage holds the action (per-tab, survives, private); a validated relative `redirectTo` path holds the destination; React Context holds neither, because it does not survive the redirect. Always allowlist the path.',
        },
        {
          id: 'm10-t7',
          title: 'Building useAuthGate — save, redirect, return, replay',
          explain:
            'A hook whose requireAuth runs the action immediately when signed in, and otherwise persists the intent, redirects to Google, and replays it on return.',
          analogy:
            'A good conductor on a Kundapura-Mangaluru bus does not make you buy the ticket before you can even board — you get on, and only when the ticket actually matters does he come round. But if you have to step off at a stop to get change, he remembers where you were sitting and what you owed, and picks up exactly there when you climb back on. `useAuthGate` is that conductor: no friction until it matters, and perfect memory across the interruption.',
          theory:
            'Everything in this section composes into one hook, `useAuthGate`, exposing one method, `requireAuth(action, intent)`. Its contract: *run `action` as soon as the user is authenticated — now if they already are, or after a sign-in round trip if they are not — and make the round trip invisible.*\n\n**The gate.** `requireAuth` first checks the session (from `SessionContext`, Module 4). If a session exists, it simply calls `action()` and returns. No redirect, no storage, no ceremony — a signed-in user tapping "Show phone number" sees the number immediately. The whole login machinery only engages for the anonymous case.\n\n**The save.** If there is no session, `requireAuth` serialises the intent — `{ type, slug, scrollY: window.scrollY }` — into `sessionStorage`, then calls `signInWithOAuth` with `redirectTo` set to the current path (validated origin + pathname, so the user returns to the same page). Save first, redirect second: the order from t5.\n\n**The return and replay.** On the fresh mount after Google returns, an effect — `useIntentReplay`, run once high in the tree — reads the intent back. It waits until the session is actually present (the code-for-session exchange is async), then: restores scroll with `window.scrollTo(0, intent.scrollY)`, dispatches on `intent.type` to replay the action (for `reveal_contact`, it triggers the same contact fetch the button would have), and — critically — **clears the intent from `sessionStorage`**. Clearing is what stops a manual page refresh from re-firing the reveal forever. An intent is single-use.\n\n**The cancel.** The user might reach Google\'s consent screen and click "Cancel", or close the tab. Then they come back with a stale intent and no session. `useIntentReplay` must handle this: if an intent exists but no session materialises, discard the intent quietly and do nothing. Never replay an action for a user who declined to sign in. The gate degrades to "nothing happened," which is the correct outcome of a cancelled consent.\n\nThe sequence diagram traces the full round trip. Watch the three writes to `sessionStorage`: write on tap, read on return, clear after replay. Those three, in that order, are the entire mechanism.',
          diagram: `sequenceDiagram
    autonumber
    actor U as User (anonymous)
    participant B as Button / requireAuth
    participant SS as sessionStorage
    participant G as Google OAuth
    participant IR as useIntentReplay (fresh mount)
    participant DB as get_artist_contact RPC

    U->>B: Tap "Show phone number"
    B->>B: session? -> no
    B->>SS: write {type:'reveal_contact', slug, scrollY}
    B->>G: signInWithOAuth redirectTo = this path
    Note over B: page navigates away, React destroyed
    G-->>IR: return to /artists/rukmini?code=...
    IR->>IR: await session from exchange
    alt session present
        IR->>SS: read intent
        IR->>IR: window.scrollTo(0, scrollY)
        IR->>DB: replay: rpc get_artist_contact(slug)
        DB-->>IR: {phone, whatsapp}
        IR->>SS: clear intent (single-use)
        IR-->>U: number revealed, same scroll, no toast
    else user cancelled consent
        IR->>SS: clear intent, do nothing
    end`,
          flowExplain:
            'The three `sessionStorage` operations — write (step 3), read (step 8), clear (step 11) — are the whole trick. The `alt` block is the cancel path: an intent with no session is discarded, never replayed.',
          whyItMatters:
            'This hook is the payoff of Module 0\'s Flow B and the interaction the entire course was building toward. It is also a reusable pattern: any "do X, but sign in first if needed" action — favourite, review, save — routes through `requireAuth`. Building it once, correctly, with the clear-after-replay and cancel handling, is what makes login feel like a detour instead of a wall.',
          steps: [
            'Read the session from `SessionContext`. In `requireAuth(action, intent)`, if a session exists, call `action()` and return immediately.',
            'Otherwise write `{ ...intent, scrollY: window.scrollY }` to `sessionStorage`, then `signInWithOAuth` with a validated `redirectTo` of the current path.',
            'Mount `useIntentReplay` once near the app root. It reads the intent and waits for the session to be present.',
            'On session present: restore scroll, switch on `intent.type` to replay the action, then delete the intent from `sessionStorage`.',
            'On intent-but-no-session (cancelled consent): delete the intent and do nothing.',
            'Ensure replay is idempotent and single-use — clearing the intent guarantees a refresh does not re-fire it.',
          ],
          code: `// hooks/useAuthGate.js
import { supabase } from '../supabase/client';
import { useSession } from '../contexts/SessionContext';

const INTENT_KEY = 'kalakaara.pendingIntent';

export function useAuthGate() {
  const { session } = useSession();

  function requireAuth(action, intent) {
    if (session) { action(); return; }          // signed in: run it now, no detour
    sessionStorage.setItem(INTENT_KEY, JSON.stringify({
      ...intent, scrollY: window.scrollY,
    }));
    supabase.auth.signInWithOAuth({              // save FIRST, then redirect
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  }
  return { requireAuth };
}

// hooks/useIntentReplay.js — mounted once near the app root.
import { useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';

export function useIntentReplay(handlers) {
  const { session, loading } = useSession();
  useEffect(() => {
    if (loading) return;                         // wait for the code->session exchange
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return;                            // nothing pending
    sessionStorage.removeItem(INTENT_KEY);       // single-use: clear BEFORE replay
    if (!session) return;                        // consent cancelled -> discard, do nothing
    const intent = JSON.parse(raw);
    window.scrollTo(0, intent.scrollY ?? 0);     // restore exact position
    handlers[intent.type]?.(intent);             // replay: e.g. reveal_contact -> fetch number
  }, [session, loading]);                        // eslint-disable-line
}`,
          pitfalls: [
            '**Not clearing the intent after replay.** Every page refresh re-fires the reveal — and could re-fire a favourite or review. Fix: `removeItem` the intent as part of replay, making it single-use.',
            '**Replaying before the session exists.** The code-for-session exchange is async; replay too early and the RPC still sees a null `auth.uid()`. Fix: gate replay on `!loading && session`.',
            '**Ignoring cancelled consent.** An intent with no session, replayed, either errors or silently does nothing useful. Fix: if intent exists but session does not, clear it and stop.',
            '**Mounting `useIntentReplay` in a component that unmounts.** The reveal only replays when that component happens to be alive. Fix: mount it once, high in the tree, so it runs on every return.',
            '**Reconstructing the action from the intent by re-reading it in every button.** Centralise replay in a `handlers` map keyed by `intent.type`. Fix: one place decides how each intent type replays.',
          ],
          tryIt:
            'Trace what happens if the user taps "Show phone number", reaches Google, clicks Cancel, and returns. Walk the `useIntentReplay` effect line by line and confirm the number is NOT revealed and the intent is gone. (raw exists -> removeItem -> session is null -> return; nothing replays.) Then confirm a refresh after a *successful* reveal does not re-fire it either (intent already cleared).',
          takeaway:
            '`useAuthGate.requireAuth` runs the action now if signed in, else saves intent and redirects; `useIntentReplay` restores scroll, replays once, and clears the intent — handling cancelled consent by doing nothing.',
        },
        {
          id: 'm10-t8',
          title: 'The wording that decides whether any of this works',
          explain:
            'The logged-out button must say "Show phone number", not "Sign in" — and after returning, the number is simply there, with no toast and no second click.',
          analogy:
            'At a santhe, the vendor who says "come, see the mangoes" gets a crowd; the one who says "first tell me your name and phone number" stands alone. Both eventually want the sale. Only one understands that you lead with what the customer wants, not with what you need from them. "Show phone number" is "come, see the mangoes." "Sign in" is the empty stall.',
          theory:
            'You have built a database gate and an invisible-detour hook. All of it is wasted if the button says the wrong thing. This topic is not decoration — the copy is a load-bearing part of the feature, and it is the part most often gotten wrong.\n\n**The button says what the user wants, not what you need.** A logged-out visitor on Rukmini\'s profile wants her phone number. The button must say **"Show phone number"**. It must not say "Sign in", "Log in to continue", or "Create an account". Those describe *your* requirement — the toll — as if it were the *user\'s* goal. The user did not come to KalaKaara to acquire an account; they came to reach an artist. Sign-in is the turnstile they pass through on the way, and a turnstile does not need a billboard. Label the button with the destination, and the sign-in happens quietly en route (that is literally what `requireAuth` does — the OAuth redirect is an implementation detail behind a button that promises a phone number).\n\n**After returning, the number is just there.** The replayed reveal should feel like the tap "worked", delayed. No "Welcome back!" toast. No "You are now signed in" banner. No requirement to find and press the button a second time. The user tapped "Show phone number", there was a brief detour they barely registered, and now the number is on screen at the scroll position they were already at. Every extra acknowledgement — a toast, a modal, a re-click — is a small betrayal of the promise the button made. Silence, with the number present, is success.\n\n**Why this doubles conversion.** The gap between "Show phone number" and "Sign in" is the gap between a user who acts and a user who bounces. "Sign in" triggers the account-fatigue reflex — *another* login, *another* password (even though it is one Google tap) — and a measurable fraction leave. "Show phone number" reads as a direct answer to their need, so they tap. Same underlying flow, same OAuth, same database gate. The only difference is five words on a button, and it is the difference between the whole system being used and being avoided. Module 0 flagged this; this is where you honour it.',
          whyItMatters:
            'Product sense — understanding that a five-word label can outweigh the entire engineering effort behind it — is what separates an engineer who ships features from one who ships *used* features. This is the kind of detail a strong interviewer loves, because it shows you think about the human on the other side of the button, not just the code behind it.',
          steps: [
            'Label the logged-out contact button with the outcome: **"Show phone number"** (and "Message on WhatsApp", "Save artist" for the other gated actions).',
            'Never label a gated action "Sign in" — sign-in is the mechanism, not the user\'s goal.',
            'On successful replay, render the number in place with no toast, no banner, no confirmation dialog.',
            'Do not require a second click after return — the original tap is the whole interaction; the reveal completes it.',
            'Restore scroll so the number appears where the user was looking, reinforcing that the tap "just worked".',
          ],
          code: `// The button promises the DESTINATION, not the turnstile.
function ContactButton({ artist }) {
  const { requireAuth } = useAuthGate();
  const [contact, setContact] = useState(null);

  function revealNow() {
    // the actual reveal — used both for an already-signed-in tap and for replay
    getArtistContact(artist.slug).then(setContact);
  }

  if (contact) {
    // returned or signed in: the number is simply THERE. No toast. No banner.
    return <a href={\`tel:\${contact.phone}\`}>{contact.phone}</a>;
  }

  return (
    <button onClick={() =>
      requireAuth(revealNow, { type: 'reveal_contact', slug: artist.slug })
    }>
      Show phone number          {/* NOT "Sign in". Ever. */}
    </button>
  );
}

// In useIntentReplay's handlers map, reveal_contact replays the SAME revealNow.
// The user never presses anything twice; the intent completes their first tap.`,
          pitfalls: [
            '**Labelling the button "Sign in".** It advertises your requirement, not their goal, and a fraction of users bounce on reflex. Fix: "Show phone number" — name the outcome.',
            '**Showing a "Welcome back!" toast after replay.** It draws attention to the detour you worked to hide. Fix: no toast; let the number\'s appearance be the only feedback.',
            '**Requiring a second click after return.** The user tapped once; making them hunt for the button again breaks the promise. Fix: replay completes the action automatically.',
            '**Landing them at the top of the page after reveal.** Even with the number shown, losing their scroll position feels like a reset. Fix: restore `scrollY` from the intent.',
            '**Using different labels for the same gated action across pages.** "Show number" here, "Contact" there, "Unlock" elsewhere confuses users. Fix: one consistent, outcome-named label everywhere.',
          ],
          tryIt:
            'Show two versions of the profile to a friend who has never seen the app — one with a "Sign in" button, one with "Show phone number" — and ask which they would tap to get the artist\'s number. The answer is unanimous, and it is the whole lesson in one informal test.',
          takeaway:
            'The logged-out button says "Show phone number", never "Sign in". After the invisible detour, the number is simply present — no toast, no banner, no second click. Five words decide whether the system is used.',
        },
      ],
    },
    {
      id: 'm10-s3',
      title: 'Reaching the artist',
      topics: [
        {
          id: 'm10-t9',
          title: 'WhatsApp with no API, no account, no rupee',
          explain:
            'A plain wa.me link with a URL-encoded prefilled message opens WhatsApp to the artist — you just need the number in E.164 format.',
          analogy:
            'You do not need to build a road to send someone to the Kollur temple — the road already exists; you just give correct directions. WhatsApp already runs on the artist\'s phone and the buyer\'s phone. `wa.me` is the directions. You are not integrating an API, paying for a gateway, or registering a business account — you are writing a correctly-formatted link and letting WhatsApp, already installed, do the rest.',
          theory:
            'WhatsApp Business API costs money and needs approval. You need none of it. WhatsApp publishes a **click-to-chat** URL scheme that is free, account-free, and works from any link: `https://wa.me/<number>?text=<url-encoded message>`. The `<number>` is the recipient in international format without `+` or spaces (for India, `91` followed by the ten digits). The `text` is a message prefilled into the chat box — the user still presses send, so it is not spam, just a helpful head start. Tapping the link opens WhatsApp (app on mobile, WhatsApp Web on desktop) with the artist selected and the message ready.\n\n**Normalising an Indian number to E.164.** The number in your database might be stored as `98765 43210`, `+91-98765-43210`, `098765 43210`, or worse. `wa.me` needs exactly `919876543210`. So normalise: strip everything that is not a digit (spaces, dashes, `+`, parentheses); if the result starts with `91` and is twelve digits, it already has the country code; if it starts with a leading `0` and is eleven digits, drop the `0`; the core must be ten digits starting `6`, `7`, `8`, or `9` (the valid range for Indian mobiles); then prepend `91`. If it does not reduce to a valid ten-digit mobile, do not build a broken link — surface an error instead. Getting E.164 right is the whole job; the link itself is trivial once the number is clean.\n\n**Prefill something useful.** An empty chat makes the buyer type from scratch and many will not bother. A prefilled message — `Hi Rukmini, I saw your portrait work on KalaKaara and would like to discuss a commission.` — lowers the effort to near zero and gives the artist context. `encodeURIComponent` the message so spaces, commas, and any Unicode survive the URL intact.\n\n**Also `tel:` and copy-to-clipboard.** Not everyone wants WhatsApp. A `tel:+91...` link opens the dialer. And a copy button — `navigator.clipboard.writeText(number)` — lets the user paste the number wherever they like. `navigator.clipboard` needs a secure context (HTTPS, which Vercel gives you) and can reject, so wrap it in a try/catch with a fallback (a hidden input plus `document.execCommand(\'copy\')`, or simply showing the number to copy manually), and always confirm success with a brief "Copied" so the user knows it worked. Three ways to reach the artist — WhatsApp, call, copy — none of them costing anything or needing an account.',
          diagram: `graph TD
    RAW["Stored number:<br/>'098765 43210' / '+91-98765-43210'"] --> STRIP[Strip non-digits<br/>-> 09876543210 / 919876543210]
    STRIP --> C91{starts 91, len 12?}
    C91 -- yes --> DROP91[drop leading 91]
    C91 -- no --> C0{starts 0, len 11?}
    C0 -- yes --> DROP0[drop leading 0]
    C0 -- no --> CORE
    DROP91 --> CORE[10-digit core]
    DROP0 --> CORE
    CORE --> VAL{matches 6-9 then 9 digits?}
    VAL -- no --> ERR[throw: invalid number<br/>no broken link]
    VAL -- yes --> E164[prepend 91 -> 919876543210]
    E164 --> LINK["wa.me/919876543210?text=encodeURIComponent(msg)"]
    style ERR fill:#fecaca
    style LINK fill:#dcfce7`,
          flowExplain:
            'The whole diagram is the normaliser: raw string in, validated E.164 out, and a hard stop if it is not a real Indian mobile. Only a clean number reaches the `wa.me` link — a broken number never builds a link at all.',
          whyItMatters:
            'This is the moment the marketplace pays off — a buyer reaching an artist — and it costs nothing to build, which is exactly the zero-cost constraint honoured. The E.164 normalisation is also a genuinely reusable skill: any SMS, WhatsApp, or telephony feature you ever build needs correctly-formatted international numbers, and interviewers do ask "how would you normalise a phone number?"',
          steps: [
            'Write `toE164India(raw)`: strip non-digits, handle a leading `91` (12 digits) or `0` (11 digits), validate a 10-digit core starting `6`-`9`, prepend `91`; throw on invalid input.',
            'Build the prefilled message with the artist\'s name and a commission ask, then `encodeURIComponent` it.',
            'Construct the link: `https://wa.me/${toE164India(phone)}?text=${encodeURIComponent(message)}` and render it as an anchor.',
            'Add a `tel:` link using the same normalised number for users who prefer to call.',
            'Add a copy-to-clipboard button using `navigator.clipboard.writeText`, wrapped in try/catch with a fallback, and confirm with a brief "Copied".',
            'Never build a link from an unvalidated number — a malformed `wa.me` URL opens WhatsApp to nothing and looks broken.',
          ],
          code: `// utils/phone.js — normalise any Indian number to E.164 (no + , digits only).
export function toE164India(raw) {
  const digits = String(raw ?? '').replace(/\\D/g, '');   // strip +, spaces, dashes, ()
  let core = digits;
  if (core.length === 12 && core.startsWith('91')) core = core.slice(2);
  else if (core.length === 11 && core.startsWith('0')) core = core.slice(1);
  if (!/^[6-9]\\d{9}$/.test(core)) {                       // valid Indian mobile?
    throw new Error(\`Not a valid Indian mobile number: \${raw}\`);
  }
  return '91' + core;                                     // -> 919876543210
}

// components/ContactActions.jsx
export function whatsappUrl(artistName, phone) {
  const msg = \`Hi \${artistName}, I saw your portrait work on KalaKaara \` +
              \`and would like to discuss a commission.\`;
  return \`https://wa.me/\${toE164India(phone)}?text=\${encodeURIComponent(msg)}\`;
}

async function copyNumber(number, onDone) {
  try {
    await navigator.clipboard.writeText(number);         // needs HTTPS (Vercel gives it)
    onDone('Copied');
  } catch {
    // fallback for old browsers / denied permission
    const el = document.createElement('input');
    el.value = number; document.body.appendChild(el); el.select();
    try { document.execCommand('copy'); onDone('Copied'); }
    catch { onDone('Press Ctrl+C to copy'); }
    finally { el.remove(); }
  }
}
// Render: <a href={whatsappUrl(name, phone)}>Message on WhatsApp</a>
//         <a href={\`tel:+\${toE164India(phone)}\`}>Call</a>
//         <button onClick={() => copyNumber(phone, setToast)}>Copy number</button>`,
          pitfalls: [
            '**Passing a number with `+`, spaces, or dashes to `wa.me`.** The link silently opens WhatsApp to no one. Fix: `wa.me` needs digits only in E.164; run every number through `toE164India` first.',
            '**Forgetting to `encodeURIComponent` the message.** Spaces and commas break the URL and the prefill arrives garbled or truncated. Fix: always encode the `text` value.',
            '**Assuming every stored number has the country code.** Some have `0`, some have `91`, some have neither. Fix: normalise all three shapes to a 10-digit core, then prepend `91` once.',
            '**Calling `navigator.clipboard.writeText` without a try/catch.** It rejects on insecure contexts or denied permission and throws unhandled. Fix: wrap it, provide a fallback, and confirm success to the user.',
            '**Building the link even when the number is invalid.** A malformed `wa.me` URL looks like a broken feature. Fix: let `toE164India` throw, catch it, and show "number unavailable" instead of a dead link.',
          ],
          tryIt:
            'Run `toE164India` on `\'098765 43210\'`, `\'+91 98765 43210\'`, `\'98765-43210\'`, and `\'12345\'`. The first three must all return `\'919876543210\'`; the last must throw. If any of the first three throws or the last returns a value, your normaliser has a gap.',
          takeaway:
            'A free `wa.me/<E.164>?text=<encoded message>` link reaches any artist with no API and no account. The real work is normalising the number to E.164 — everything else is a link and an `encodeURIComponent`.',
        },
        {
          id: 'm10-t10',
          title: 'Sharing a profile, and the honest limits of abuse control',
          explain:
            'Share a profile with the Web Share API and a copy-link fallback, then accept that a public number is scrapeable and do the free things that actually help.',
          analogy:
            'Handing someone a temple\'s address so they can visit is sharing — useful, welcome. But once an address is on a public notice board, anyone can copy it, including people you would rather not. You can note who asked at the counter (an audit log) and turn away someone who asks a hundred times an hour (a rate limit), but you cannot un-print the board. Pretending otherwise is where free-stack security stops being honest.',
          theory:
            '**Sharing, done natively.** The Web Share API — `navigator.share({ title, text, url })` — opens the device\'s real share sheet on mobile: WhatsApp, Instagram, SMS, whatever the user has. It is one call, no integration, and it feels native because it is. But it exists mainly on mobile and requires a secure context and a user gesture, so it is not always available. Feature-detect with `navigator.share`, and when it is absent — most desktops — fall back to copying the profile URL to the clipboard with a "Link copied" confirmation. One primary path, one fallback, full coverage.\n\n**Now the honest part: a revealed number can be scraped.** Everything this module built raises the cost of harvesting phone numbers — a scraper must now hold a real Google session and call the RPC per artist — but it does not make it impossible. Once a signed-in user sees a number, that number is on their screen and in their clipboard; nothing on a free stack can prevent a determined person from collecting them one at a time. It is important to say this plainly rather than imply the gate is airtight.\n\n**What you can actually do on a free stack.** Three things, all real, all free. First, **require auth** — done; the number never reaches an anonymous caller, so casual bulk scraping needs an authenticated session, which raises the cost. Second, **audit every reveal**: insert a row into a `contact_reveals` table (`user_id`, `artist_id`, `created_at`) each time the RPC runs. Now there is a record, and abuse is visible. Third, **rate-limit per user**: before revealing, check how many rows that user inserted into `contact_reveals` in the last hour, and refuse past a threshold. This is enforceable in the same `security definer` RPC — count recent inserts for `auth.uid()`, and if it exceeds the limit, return zero rows. A scraper is now capped at, say, thirty reveals an hour per account, and every one is logged.\n\n**And the honest boundary.** What you *cannot* do for free: proxy phone numbers (the buyer sees a masked number that forwards to the artist), in-app chat (so the real number never leaves the server at all), or per-IP rate limiting robust against rotating IPs. Those are the real solutions to determined abuse, and every one of them costs money — a telephony provider, a messaging backend, infrastructure. They are deliberately out of scope for a zero-cost course, and the mature thing is to name them as the paid upgrade path rather than pretend the free version is bulletproof. You have made abuse expensive and visible. Making it impossible costs money, and this course does not spend it.',
          diagram: `graph TD
    subgraph SHARE[Sharing]
      S{navigator.share available?}
      S -- yes, mobile --> NS[Native share sheet<br/>WhatsApp, SMS, Instagram]
      S -- no, desktop --> CL[Copy profile URL<br/>+ 'Link copied']
    end
    subgraph ABUSE[Abuse control on a free stack]
      A1[Require auth ✓ done<br/>no number to anon]
      A2[Log every reveal ->\\ncontact_reveals table]
      A3[Rate-limit: count last hour\\nfor auth.uid, cap it]
      A1 --> MADE[Abuse is expensive + visible]
      A2 --> MADE
      A3 --> MADE
      MADE --> HON[But NOT impossible]
      HON --> PAID[Real fixes cost money:<br/>proxy numbers, in-app chat<br/>-> out of scope]
    end
    style PAID fill:#fef3c7`,
          flowExplain:
            'Sharing is a simple availability branch. The abuse box is the honest one: three free measures make harvesting expensive and logged, but the final node admits the real fixes cost money and are deliberately excluded.',
          whyItMatters:
            'Knowing the limits of your own security is more valuable than claiming there are none. An engineer who says "auth plus an audit log plus a per-user rate limit makes abuse expensive and visible, and a real fix needs paid proxy numbers which are out of scope" demonstrates exactly the honest, scoped judgment senior roles are hired for. Overclaiming security is how real breaches get shipped.',
          steps: [
            'Implement share: feature-detect `navigator.share`; if present, call it with the profile title and URL; if absent, copy the URL and confirm "Link copied".',
            'Create a `contact_reveals` table: `id`, `user_id` (default `auth.uid()`), `artist_id`, `created_at`, with RLS so users only see their own rows.',
            'Insert a `contact_reveals` row inside `get_artist_contact` each time it returns a number to a signed-in caller.',
            'Add a per-user rate limit in the RPC: count that user\'s reveals in the last hour; if over the threshold, return zero rows.',
            'State the limits explicitly in your README: auth + audit + rate limit make abuse expensive and visible; proxy numbers and in-app chat are the paid, out-of-scope real fixes.',
            'Never imply the number is unscrapeable — a revealed number is, by definition, in the user\'s hands.',
          ],
          code: `// components/ShareButton.jsx
async function shareProfile(artist) {
  const url = \`\${window.location.origin}/artists/\${artist.slug}\`;
  const data = { title: artist.displayName,
                 text: \`\${artist.displayName} on KalaKaara\`, url };
  if (navigator.share) {                     // mobile: real share sheet
    try { await navigator.share(data); } catch { /* user dismissed — fine */ }
  } else {                                   // desktop: copy the link
    await navigator.clipboard.writeText(url);
    // show "Link copied"
  }
}

-- Audit + per-user rate limit, enforced inside the same definer RPC.
create table public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  artist_id uuid not null references public.artists(id),
  created_at timestamptz not null default now()
);
alter table public.contact_reveals enable row level security;
create policy "own reveals readable" on public.contact_reveals
  for select to authenticated using (user_id = auth.uid());

create or replace function public.get_artist_contact(artist_slug text)
returns table(phone text, whatsapp text)
language plpgsql security definer set search_path = public as $$
declare a_id uuid; recent int;
begin
  if auth.uid() is null then return; end if;               -- anon: 0 rows
  select id into a_id from artists where slug = artist_slug;
  if a_id is null then return; end if;
  select count(*) into recent from contact_reveals         -- per-user rate limit
   where user_id = auth.uid() and created_at > now() - interval '1 hour';
  if recent >= 30 then return; end if;                     -- capped, quietly
  insert into contact_reveals(artist_id) values (a_id);    -- audit this reveal
  return query select ar.phone, ar.whatsapp from artists ar where ar.id = a_id;
end $$;`,
          pitfalls: [
            '**Calling `navigator.share` without feature-detecting it.** It is undefined on most desktops and throws. Fix: `if (navigator.share)` then call, else fall back to copying the URL.',
            '**Claiming the number cannot be scraped.** A revealed number is on the user\'s screen and clipboard; you cannot recall it. Fix: state honestly that auth + audit + rate limit make abuse expensive and visible, not impossible.',
            '**Rate-limiting in React instead of the database.** A client check is trivially bypassed by calling the RPC directly with the anon key and a session. Fix: enforce the limit inside the `security definer` RPC where the client cannot skip it.',
            '**Logging reveals without RLS on the audit table.** Then one user can read everyone\'s reveal history. Fix: `enable row level security` and a `user_id = auth.uid()` select policy.',
            '**Promising proxy numbers or in-app chat on a free stack.** Both need paid infrastructure. Fix: name them as the out-of-scope paid upgrade, not something the course delivers.',
          ],
          tryIt:
            'Set the rate limit to 3 and reveal four different artists in an hour from one account. The fourth should return no number. Then check `contact_reveals` and confirm three rows were logged. You have just built and proven a working, free, per-user rate limit — and seen exactly where it stops.',
          takeaway:
            'Share natively with a copy-link fallback. For abuse, do the free things that work — require auth, log every reveal, rate-limit per user in the RPC — and say plainly that a public number is scrapeable and the real fix costs money.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm10-p1',
      type: 'Mini Project',
      title: 'The Contact Gate, Watertight',
      domain: 'Access Control & Auth-Gated Actions',
      duration: '2 hours',
      description:
        'Build the complete contact system so that a logged-out visitor can never obtain a phone number from any network response, a signed-in visitor reaches it through an invisible sign-in detour that returns them to exactly where they were, and reaching the artist is one tap on WhatsApp. The acceptance test is brutal and specific: logged out, the number appears in zero response bodies.',
      tools: ['React', 'Supabase', 'PostgreSQL', 'RLS', 'security definer', 'Google OAuth', 'Web Share API'],
      blueprint: {
        overview:
          'A full auth-gated contact feature in three layers. In Postgres: an `artists_public` view that omits the contact columns, a `security definer` `get_artist_contact` RPC that returns the number only to a signed-in caller (pinned `search_path`, per-user rate limit, audit insert), and a `contact_reveals` table with RLS. In React: a `useAuthGate` hook that saves intent to `sessionStorage` and redirects, a `useIntentReplay` hook that restores scroll and replays the reveal once, a "Show phone number" button, and a WhatsApp deep link with E.164 normalisation, copy-to-clipboard, and Web Share. The whole thing is verified from the wire, not the screen.',
        functionalRequirements: [
          '**Column withheld in the database.** Browse and artist-detail read `artists_public`, which has no `phone` or `whatsapp` column; the base `artists` table is not readable by `anon`.',
          '**Authenticated reveal only.** `get_artist_contact(slug)` returns the number to a signed-in caller and zero rows to an anonymous one, enforced in its `where` clause, not in React.',
          '**Invisible sign-in detour.** Tapping "Show phone number" while logged out saves the intent to `sessionStorage`, redirects to Google, and on return restores scroll and reveals the number with no second click and no toast.',
          '**Cancelled consent is safe.** Returning from Google without signing in discards the intent and does nothing; a refresh after a successful reveal does not re-fire it.',
          '**Validated redirect.** Any `next` path is checked against an allowlist (relative, single leading slash, no scheme) before navigation, so the flow is not an open redirect.',
          '**Reaching the artist.** A `wa.me` link with an E.164-normalised number and a prefilled commission message, a `tel:` link, a copy-to-clipboard button with fallback, and a Web Share button with a copy-link fallback.',
          '**Abuse control.** Every reveal is logged to `contact_reveals`; a per-user hourly rate limit is enforced inside the RPC; the README states honestly what free measures can and cannot do.',
        ],
        technicalImplementation: [
          '**`artists_public` view + revoked base grants.** Explicit safe column list; `revoke select on artists from anon, authenticated`; `grant select on artists_public`.',
          '**`get_artist_contact` RPC.** `security definer`, `set search_path = public`, `auth.uid() is not null` guard, rate-limit count on `contact_reveals`, audit insert, returns `table(phone, whatsapp)`.',
          '**`useAuthGate` + `useIntentReplay`.** Intent in `sessionStorage` under one key; replay reads once, restores `scrollY`, dispatches on `intent.type`, clears the key; handles the no-session (cancelled) case.',
          '**`isSafeNext` allowlist.** Rejects absolute URLs, protocol-relative `//`, schemes, and control characters; falls back to `/`.',
          '**`utils/phone.js` `toE164India`.** Strips non-digits, handles leading `91`/`0`, validates a 10-digit `6`-`9` core, throws on invalid; used by both the `wa.me` and `tel:` links.',
          '**`ShareButton` + `copyNumber`.** Feature-detected `navigator.share`; `navigator.clipboard.writeText` with an `execCommand` fallback and a confirmation.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Database gate: view, RPC, audit table, rate limit',
            outcome:
              'A migration where the contact columns are unreachable by anonymous callers and revealed only through a rate-limited, audited, security-definer RPC.',
            prompt:
              'In my Supabase project, write one SQL migration that builds the contact gate. (1) Create a view `public.artists_public` selecting every artists column EXCEPT `phone` and `whatsapp`, filtered to `is_published = true`; grant `select` on it to `anon` and `authenticated`; then `revoke select on public.artists from anon, authenticated` so the base table is unreachable by public roles. (2) Create table `public.contact_reveals` with `id uuid pk default gen_random_uuid()`, `user_id uuid not null default auth.uid() references auth.users`, `artist_id uuid not null references public.artists`, `created_at timestamptz default now()`; enable RLS; add a select policy so a user reads only rows where `user_id = auth.uid()`. (3) Create `public.get_artist_contact(artist_slug text) returns table(phone text, whatsapp text)` as `language plpgsql security definer set search_path = public`: return immediately (zero rows) if `auth.uid()` is null; look up the artist id by slug; count this user\'s `contact_reveals` in the last hour and return zero rows if it is 30 or more; insert an audit row; then return the phone and whatsapp. Grant `execute` to `authenticated` only. Explain in comments why `set search_path = public` is mandatory and why the function returns zero rows instead of raising for an anonymous caller.',
          },
          {
            step: 2,
            label: 'Verify the gate from the wire',
            outcome:
              'Proof, from both SQL and the browser Network tab, that a logged-out caller obtains the number from nowhere.',
            prompt:
              'Give me a verification checklist for the contact gate and the service function to drive it. First, SQL: inside a transaction, `set local role anon`, then attempt to read the number three ways — `select * from artists_public where slug = ...` (no phone column), `select phone from artists where slug = ...` (permission denied), and `select * from get_artist_contact(...)` (zero rows) — then `rollback`. Second, write `services/artistService.js` `getArtistContact(slug)` that calls `supabase.rpc(\'get_artist_contact\', { artist_slug: slug })`, throws on error, and returns the first row or null. Third, write step-by-step browser instructions: open the artist page in an incognito window, open DevTools Network, reload, and confirm that no response body from any `*.supabase.co` request contains the phone digits or the strings "phone" or "whatsapp". State that the screen is not the evidence — the response body is.',
          },
          {
            step: 3,
            label: 'useAuthGate, intent replay, and the safe-redirect guard',
            outcome:
              'A hook that runs a gated action immediately when signed in and otherwise saves intent, redirects, and replays it once on return — with an open-redirect guard.',
            prompt:
              'Write `hooks/useAuthGate.js` and `hooks/useIntentReplay.js` and `utils/isSafeNext.js`. `useAuthGate` reads the session from `SessionContext` and returns `requireAuth(action, intent)`: if a session exists, call `action()` and return; otherwise write `{ ...intent, scrollY: window.scrollY }` to `sessionStorage` under the key `kalakaara.pendingIntent`, then call `supabase.auth.signInWithOAuth({ provider: \'google\', options: { redirectTo: window.location.origin + window.location.pathname } })`. `useIntentReplay(handlers)` runs an effect that, once the session is no longer loading, reads the intent key, removes it immediately (single-use), returns without acting if there is no session (cancelled consent), and otherwise restores scroll with `window.scrollTo(0, intent.scrollY)` and calls `handlers[intent.type](intent)`. `isSafeNext(next)` returns true only for a non-empty string that starts with a single `/`, does not start with `//`, contains no `://`, and contains no control characters. Add comments explaining that Context does not survive the OAuth navigation and that an unvalidated `next` is an open redirect.',
          },
          {
            step: 4,
            label: 'The "Show phone number" button and reveal replay',
            outcome:
              'A button labelled by outcome that reveals the number in place after the detour, wired into the intent-replay handler.',
            prompt:
              'Write a `ContactButton` component for the artist-detail page. It uses `useAuthGate`. When there is no revealed contact yet, it renders a button labelled exactly "Show phone number" (never "Sign in") whose `onClick` calls `requireAuth(revealNow, { type: \'reveal_contact\', slug: artist.slug })`, where `revealNow` calls `getArtistContact(artist.slug)` and stores the result in local state. When the contact is present, render the phone as a `tel:` link and a "Message on WhatsApp" link with no toast or banner. Then register a `reveal_contact` handler in the app-root `useIntentReplay` handlers map that calls the same reveal for the intent\'s slug, so a user returning from Google sees the number appear in place at their previous scroll position without pressing anything again. Emphasise in comments that the reveal must not require a second click.',
          },
          {
            step: 5,
            label: 'WhatsApp deep link, copy-to-clipboard, and share',
            outcome:
              'E.164 normalisation, a prefilled wa.me link, a robust copy button, and native share with a copy-link fallback.',
            prompt:
              'Write `utils/phone.js` exporting `toE164India(raw)`: strip all non-digits, drop a leading `91` if the result is 12 digits or a leading `0` if 11 digits, validate the remaining 10-digit core matches `^[6-9]\\d{9}$` (throw a clear error otherwise), and return `91` + core. Then write a `ContactActions` component that renders: a WhatsApp anchor to `https://wa.me/${toE164India(phone)}?text=${encodeURIComponent(msg)}` where `msg` is "Hi <name>, I saw your portrait work on KalaKaara and would like to discuss a commission."; a `tel:` link using the same normalised number; a "Copy number" button using `navigator.clipboard.writeText` wrapped in try/catch with a hidden-input `execCommand(\'copy\')` fallback and a "Copied" confirmation; and a "Share profile" button using `navigator.share({ title, text, url })` when available, falling back to copying the profile URL with a "Link copied" confirmation. Guard every number with `toE164India` so a malformed number shows "number unavailable" rather than building a dead link.',
          },
        ],
        deliverable:
          'A working contact system where the acceptance test passes: logged out, the phone number appears in zero network response bodies (verified in an incognito Network tab); logged in via an invisible detour, the number reveals in place at the previous scroll position with no second click; and one tap opens WhatsApp to the artist with a prefilled message. Reveals are logged and rate-limited in the database, and the README states honestly what the free stack can and cannot defend against.',
      },
    },
  ],
  quiz: [
    {
      id: 'm10-q1',
      q: 'Why can a Row Level Security policy not hide the phone column of an artist row that a logged-out visitor is allowed to see?',
      options: [
        'Because RLS policies can only be written for the authenticated role, never for anon',
        'Because a view must always be created before any RLS policy can take effect',
        'Because RLS filters whole rows in or out; it has no way to null one column of a row it returns',
        'Because Supabase disables RLS on any table that has a phone column',
      ],
      answer: 2,
    },
    {
      id: 'm10-q2',
      q: 'Why is `set search_path = public` mandatory on the `security definer` contact function?',
      options: [
        'It makes the function run faster by caching the schema lookup',
        'Without it, a caller who controls their own search_path can point unqualified names at malicious objects and run code with the function owner\'s elevated privileges',
        'It is required only for `language plpgsql` functions, not `language sql` ones',
        'It prevents the function from returning more than one row at a time',
      ],
      answer: 1,
    },
    {
      id: 'm10-q3',
      q: 'You render the phone number in a span with `display:none`. Why does this leak?',
      options: [
        'The value still travelled from Postgres into the DOM; `display:none` hides paint, not presence, and Inspect reveals it',
        'CSS classes are visible in the stylesheet, so the number can be read from the CSS file',
        'display:none is overridden by the browser on secure origins',
        'It does not leak; display:none fully removes the element and its data',
      ],
      answer: 0,
    },
    {
      id: 'm10-q4',
      q: 'You read a `?next=` value after OAuth and call `navigate(next)` directly. What is the risk?',
      options: [
        'The scroll position is lost because navigate resets it',
        'sessionStorage is cleared whenever a next param is present',
        'React re-renders twice, causing a flash of the wrong page',
        'It is an open redirect: an attacker sends a victim a link with next set to an external phishing URL, and your own code redirects them there after they trust your sign-in',
      ],
      answer: 3,
    },
    {
      id: 'm10-q5',
      q: 'Why must the "what the user was trying to do" be stored in sessionStorage rather than React Context before the OAuth redirect?',
      options: [
        'Context is slower to read than sessionStorage on mobile devices',
        'sessionStorage automatically syncs the intent to the server',
        'signInWithOAuth is a full page navigation that destroys the JavaScript heap, so Context is wiped, while sessionStorage survives the round trip',
        'Context can only hold strings, and the intent is an object',
      ],
      answer: 2,
    },
    {
      id: 'm10-q6',
      q: 'What should the contact button say to a logged-out visitor, and why?',
      options: [
        '"Sign in", because the user must understand an account is required before proceeding',
        '"Show phone number", because it names the outcome the user wants; the sign-in is an invisible turnstile on the way, not the destination',
        '"Create account", because it sets expectations that they are joining KalaKaara',
        '"Log in to reveal", because it explains the mechanism transparently',
      ],
      answer: 1,
    },
    {
      id: 'm10-q7',
      q: 'What does using a `wa.me` click-to-chat link require you to sign up or pay for?',
      options: [
        'Nothing — wa.me is a free public URL scheme needing no API, no account, and no payment; you only format the number as E.164 and encode the message',
        'A WhatsApp Business API account and an approved message template',
        'A paid messaging gateway that charges per message sent',
        'A verified business phone number registered with Meta',
      ],
      answer: 0,
    },
  ],
}

// Module 8 — Direct Messages
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m8 = {
  id: 'm8',
  title: 'Direct Messages',
  hours: 7,
  color: 'from-fuchsia-500/20 to-fuchsia-700/10',
  accent: 'fuchsia',
  description:
    'Build real-time one-to-one chat: a conversations/participants schema with the hardest RLS policies in the course, a find-or-create conversation flow, optimistic message sending, live delivery via Realtime, read receipts, an unread badge, and a typing indicator via Supabase Presence.',
  sections: [
    {
      id: 'm8-s1',
      title: 'A schema built for chat',
      topics: [
        {
          id: 'm8-t1',
          title: 'conversations & conversation_participants',
          explain:
            'A conversation is its own row, with a separate join table listing who is in it — this shape, though slightly more setup than a single "chat between two ids" table, is what lets LocalInsta add group chats later without a schema rewrite.',
          analogy:
            'A wedding hall booking is its own entry in the diary — a specific date, a specific hall — and a separate guest list is attached to it, rather than trying to cram "who is attending" directly into the booking\'s own row as a fixed pair of names. That separation is exactly why the hall can later host a two-person meeting or a fifty-person reception with the same booking system.',
          theory:
            '`conversations` is deliberately minimal: `id`, `created_at`. `conversation_participants` is the join table: `conversation_id references conversations(id)`, `user_id references profiles(id)`, `joined_at`, with a composite primary key `(conversation_id, user_id)` (a participant can appear in a given conversation exactly once — no need for a separate `id` column here, the composite pair already uniquely identifies each row).\n\nThis two-table shape is more setup than a simpler `messages(sender_id, recipient_id, body)` design would need for pure 1:1 chat — but a `sender_id`/`recipient_id` pair fundamentally cannot express a group conversation without a painful later migration. LocalInsta commits to the two-table shape from the start specifically so a future "group chat" feature is an *additive* change (just allowing more than two rows per `conversation_id`), not a schema rewrite — the same "design for the shape of the problem, not just today\'s feature" thinking Module 3 applied throughout.',
          whyItMatters:
            'This is a genuine, realistic architecture trade-off worth being able to explain: slightly more schema complexity today, in exchange for avoiding a painful migration later — exactly the kind of judgment call a senior engineer is expected to make deliberately, not by accident.',
          steps: [
            'Create `conversations(id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now())`.',
            'Create `conversation_participants(conversation_id uuid references conversations(id) on delete cascade, user_id uuid references profiles(id) on delete cascade, joined_at timestamptz not null default now(), primary key (conversation_id, user_id))`.',
            'Insert one test conversation and two participant rows via SQL Editor, modeling a 1:1 chat between two seed profiles.',
            'Write a query answering "which conversations is user X part of" — the exact shape the conversations-list screen will use.',
          ],
          code: `create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index idx_participants_user on public.conversation_participants(user_id);

-- A test 1:1 conversation between two seed profiles
insert into public.conversations default values returning id;
-- (note the returned id, then:)
insert into public.conversation_participants (conversation_id, user_id)
select '<returned id>', id from public.profiles where username in ('anjali_ks', 'ravi_kundapura');

-- Which conversations is anjali_ks part of?
select c.id from public.conversations c
join public.conversation_participants cp on cp.conversation_id = c.id
join public.profiles p on p.id = cp.user_id
where p.username = 'anjali_ks';`,
          pitfalls: [
            '**Modeling chat as `messages(sender_id, recipient_id, body)` with no separate conversation concept.** Simpler at first, but adding group chat later means an invasive schema and query rewrite touching every existing message. Fix: commit to the conversation + participants shape now, even for pure 1:1 chat.',
            '**Giving `conversation_participants` its own auto-generated `id` column.** Unnecessary — the composite `(conversation_id, user_id)` primary key already uniquely and meaningfully identifies each row, and using it directly (rather than an arbitrary surrogate id) makes the "one participant per conversation" invariant structurally explicit. Fix: composite primary keys are the right tool when a natural, meaningful unique pair already exists.',
            '**Forgetting `on delete cascade` on both foreign keys.** Deleting a conversation should clean up its participant rows; deleting a profile should clean up their participation records. Fix: cascade both, matching every other ownership relationship in this course\'s schema.',
            '**Not indexing `conversation_participants.user_id`.** The "which conversations is this user part of" query (used by the conversations list screen) needs this index to stay fast. Fix: index it explicitly, per Module 3\'s indexing discipline.',
          ],
          tryIt:
            'Create a second test conversation between a different pair of your seed profiles, then write and run the "which conversations is X part of" query for a profile who is part of both conversations, confirming it returns exactly two conversation ids.',
          takeaway: 'A conversation + participants join table costs a little more setup than a sender/recipient pair, in exchange for group chat being an additive feature later, not a rewrite.',
        },
        {
          id: 'm8-t2',
          title: 'The messages table',
          explain:
            'One row per message — `conversation_id`, `sender_id`, `body`, `created_at` — a close cousin of Module 3\'s `comments` table, now scoped to a conversation instead of a post.',
          analogy:
            'A running chit-chat notebook on a shop counter shared between two familiar regulars — every line dated, every line signed, read back in the order it was written.',
          theory:
            '`messages(id, conversation_id references conversations(id), sender_id references profiles(id), body text not null check (length(body) between 1 and 2000), created_at timestamptz not null default now())` — structurally almost identical to Module 3\'s `comments` table (a body with a length check, an owner reference, a timestamp), just scoped to `conversation_id` instead of `post_id`. The length cap is deliberately more generous than a comment\'s 500 characters — chat messages reasonably run longer.\n\nAn index on `(conversation_id, created_at)` is what makes "load this conversation\'s messages, chronologically" — the single most frequent query this table will ever serve — fast, exactly mirroring `comments\'` `post_id` index from Module 3.',
          whyItMatters:
            'Recognising this table as "comments, but for a conversation instead of a post" is a good, fast pattern-match — most of what Module 3 taught about comments\' schema shape, indexing, and length constraints transfers directly, with almost nothing genuinely new here.',
          steps: [
            'Create the `messages` table as described above.',
            'Add the composite `(conversation_id, created_at)` index.',
            'Insert a few test messages into your test conversation from the previous topic, alternating sender.',
            'Query them back ordered chronologically and confirm the shape matches what a chat UI needs.',
          ],
          code: `create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on public.messages(conversation_id, created_at);

insert into public.messages (conversation_id, sender_id, body)
select '<conversation id>', id, 'Hey! Saw your Trasi beach post 🌅'
from public.profiles where username = 'ravi_kundapura';

insert into public.messages (conversation_id, sender_id, body)
select '<conversation id>', id, 'Thanks! Was there at sunrise'
from public.profiles where username = 'anjali_ks';

select body, sender_id, created_at from public.messages
where conversation_id = '<conversation id>'
order by created_at;`,
          pitfalls: [
            '**Skipping the composite index and only indexing `conversation_id` alone.** Works, but a composite index matching the exact `where conversation_id = ... order by created_at` query shape is meaningfully faster at scale — the same lesson Module 3 taught generally, applied here specifically. Fix: index the real query shape, not just the filter column alone.',
            '**No length check on `body`.** The same free-tier-protection reasoning from Module 3\'s comments applies directly — an unbounded message could bloat the database for no legitimate reason. Fix: a generous but real cap, as shown.',
            '**Not yet writing RLS for this table.** It is currently, correctly, fully closed (default-deny, Module 3) until the next topic\'s policies are added — do not be alarmed that nothing works yet at this exact point.',
            '**Forgetting `sender_id` needs its own consideration in the eventual RLS policy — being a participant is not quite the same check as being the sender.** Worth previewing mentally before the next topic: reading a conversation requires "am I a participant"; sending a message requires "am I a participant AND am I claiming to be myself".',
          ],
          tryIt:
            'Insert several alternating test messages into your test conversation and confirm the chronological query returns them in the exact order they were sent — this is precisely the query the chat screen will run.',
          takeaway: 'messages is comments\' close cousin — same shape, same indexing discipline, scoped to a conversation instead of a post.',
        },
        {
          id: 'm8-t3',
          title: 'RLS for chat: the hardest policy in the course',
          explain:
            'Reading or writing a conversation\'s messages requires checking "is the current user a participant in this conversation" — a subquery against `conversation_participants`, not a simple column comparison.',
          analogy:
            'A private meeting room where the door does not just check "is your name on this specific piece of paper" — it checks against the building\'s separate, official attendee list for that room before letting you in or letting you speak. The check involves consulting a second record, not just reading a label on the door itself.',
          theory:
            'Every RLS policy so far in this course has compared a single column directly to `auth.uid()` (`auth.uid() = user_id`). Chat cannot do this directly — a `messages` row does not itself say "these are the allowed readers", only `sender_id`. The correct check requires a **subquery**: `exists (select 1 from conversation_participants where conversation_id = messages.conversation_id and user_id = auth.uid())` — "does a row exist in the participants table proving the current user belongs to this message\'s conversation".\n\nThis same subquery pattern secures **both** `conversations` and `messages`: for `conversations`, a `select` policy checking participancy in that conversation\'s id; for `messages`, `select` checks participancy in the message\'s `conversation_id`, and `insert` checks participancy **and** that `sender_id = auth.uid()` (so you cannot send a message into a conversation you are in, while pretending to be a different participant). `conversation_participants` itself needs a `select` policy too — a user should be able to see who else is in their own conversations, checked via the same "am I also a participant here" subquery against itself.',
          whyItMatters:
            'This is genuinely the most conceptually demanding RLS policy in the entire course — subquery-based, self-referential in places — and getting comfortable with it means you can secure almost any real-world relational access pattern, not just simple single-owner rows.',
          steps: [
            'Write the `select` policy on `conversations`: participancy check via subquery against `conversation_participants`.',
            'Write the `select` policy on `messages`: the same participancy subquery, scoped by `conversation_id`.',
            'Write the `insert` policy on `messages`: participancy subquery **and** `with check (auth.uid() = sender_id)`.',
            'Write the `select` policy on `conversation_participants` itself: a user may see participant rows for any conversation they are also a participant in (a self-referential subquery against the same table).',
            'Test via impersonation (Module 3\'s technique): confirm a user who is NOT a participant in your test conversation cannot read its messages at all, even knowing the exact conversation id.',
          ],
          code: `alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- conversations: readable only if you are a participant
create policy "participants read their conversations"
on public.conversations for select
to authenticated
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
  )
);

-- conversation_participants: readable if you're ALSO a participant in that same conversation
create policy "participants see co-participants"
on public.conversation_participants for select
to authenticated
using (
  exists (
    select 1 from public.conversation_participants cp2
    where cp2.conversation_id = conversation_participants.conversation_id
      and cp2.user_id = auth.uid()
  )
);

-- messages: readable only if you are a participant in that conversation
create policy "participants read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
  )
);

-- messages: sendable only as yourself, only into a conversation you're part of
create policy "participants send messages as themselves"
on public.messages for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
  )
);`,
          pitfalls: [
            '**Checking only `sender_id = auth.uid()` on the messages select policy, forgetting a reader is not necessarily a sender.** Would block a participant from reading messages sent *to* them by someone else — the opposite of what a chat needs. Fix: the select policy checks conversation *participancy*, not message *authorship*.',
            '**Forgetting the `with check (auth.uid() = sender_id)` half of the insert policy, checking only participancy.** Would let any participant send a message while claiming to be a different participant in the same conversation. Fix: both conditions are required together.',
            '**A `conversation_participants` select policy that is too permissive** (e.g. `using (true)`), leaking who is talking to whom across the entire app. Fix: the self-referential "am I also a participant" subquery is the correct, narrow scope.',
            '**Not testing the negative case — a genuine non-participant attempting to read a conversation they know the id of.** The positive case (a real participant reading their own messages) working is not sufficient proof the policy is correct. Fix: Module 3\'s impersonation technique, applied specifically to the "outsider" case, is the real test.',
          ],
          tryIt:
            'Using Module 3\'s impersonation technique, confirm a third seed profile (not a participant in your test conversation) genuinely cannot `select` any messages from it, even with the exact conversation id in hand — then confirm both real participants can read and send normally.',
          takeaway: 'Chat security needs a subquery-based "am I a participant" check, not a simple column comparison — the most demanding, and most broadly useful, RLS pattern in this course.',
        },
        {
          id: 'm8-t4',
          title: 'Find-or-create: starting a conversation',
          explain:
            'Tapping "Message" on a profile should reuse an existing 1:1 conversation if one already exists between those two users, never silently create a duplicate.',
          analogy:
            'Calling a shop you have called before should ring the same line you always use, not accidentally open a brand-new phone connection every single time — a returning conversation should always find its existing thread, not fork into parallel duplicates.',
          theory:
            'A **database function** (Module 3\'s RPC pattern) is the right tool here, exactly like `toggle_like`: `find_or_create_conversation(other_user_id uuid)` first checks whether a conversation already exists containing **exactly** these two participants and no others (distinguishing a genuine 1:1 from a hypothetical future group conversation that happens to include both users), returning its id if so; otherwise it creates a new `conversations` row plus two `conversation_participants` rows, atomically, inside one function call — avoiding a race where two rapid taps could otherwise create two separate conversations between the same pair.\n\nThis is `security invoker` (like `toggle_like`), since it only ever needs the calling user\'s own permissions — the RLS policies from the previous topic already permit a user to create conversations and add themselves as a participant.',
          whyItMatters:
            'The "find existing, or atomically create" pattern generalises well beyond chat — anywhere a user action should be idempotent-feeling ("start a conversation", "add to cart", "join a group") rather than blindly duplicating on every trigger, this exact function shape applies.',
          steps: [
            'Write `find_or_create_conversation(other_user_id uuid)` as a Postgres function.',
            'Inside, query for a conversation where **exactly** `{auth.uid(), other_user_id}` are the full participant set (not a superset, in case group chats exist later) — a `group by`/`having count(*) = 2` pattern works well here.',
            'If found, `return` its id.',
            'If not, insert a new conversation and two participant rows, then return the new id.',
            'Call it from Flutter via `supabase.rpc(\'find_or_create_conversation\', params: {\'other_user_id\': targetUserId})` from a "Message" button on `ProfileScreen`.',
          ],
          code: `create or replace function public.find_or_create_conversation(other_user_id uuid)
returns uuid
language plpgsql
security invoker
as $$
declare
  existing_id uuid;
  new_id uuid;
begin
  -- Find a conversation containing EXACTLY these two participants
  select cp.conversation_id into existing_id
  from public.conversation_participants cp
  where cp.conversation_id in (
    select conversation_id from public.conversation_participants
    where user_id in (auth.uid(), other_user_id)
    group by conversation_id
    having count(distinct user_id) = 2
  )
  group by cp.conversation_id
  having count(*) = 2
  limit 1;

  if existing_id is not null then
    return existing_id;
  end if;

  -- None found — create atomically
  insert into public.conversations default values returning id into new_id;
  insert into public.conversation_participants (conversation_id, user_id)
  values (new_id, auth.uid()), (new_id, other_user_id);

  return new_id;
end;
$$;`,
          pitfalls: [
            '**Only checking "a conversation containing both users" without confirming it contains *exactly* those two.** Would incorrectly reuse a hypothetical three-person group conversation for what should be a private 1:1 thread. Fix: the `having count(*) = 2` (combined with the inner exact-pair check) guarantees an exact match, not just a superset.',
            '**Creating the conversation and participant rows from Flutter as three separate calls instead of one atomic function.** Reopens the exact race-condition risk (two rapid taps creating two conversations) this function exists to close. Fix: one RPC call, one transaction, atomic by construction.',
            '**Not handling the reflexive case (a user "messaging themselves") explicitly.** LocalInsta\'s UI should never present a Message button on your own profile in the first place (mirroring the follow-button omission from Module 6) — worth confirming this is true rather than relying on the function to reject it.',
            '**Forgetting this function still needs the RLS policies from the previous topic to actually succeed.** `security invoker` means it runs as the calling user, fully subject to those policies — a broken policy would still block this function too, exactly like Module 3\'s `toggle_like` lesson.',
          ],
          tryIt:
            'Call `find_or_create_conversation` twice in a row (as the same user, targeting the same other user) via SQL Editor\'s `select public.find_or_create_conversation(\'<other user id>\');` and confirm both calls return the identical conversation id, not two different ones.',
          takeaway: 'An atomic find-or-create RPC function is what prevents duplicate conversations from a race between rapid taps — the same reasoning as Module 3\'s toggle_like, applied to a new problem.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Chat UI & realtime delivery',
      topics: [
        {
          id: 'm8-t5',
          title: 'The conversations list screen',
          explain:
            'A list of the current user\'s conversations, each showing the other participant and a preview of the most recent message — the chat equivalent of Module 5\'s feed query.',
          analogy:
            'A hotel\'s message-slip pigeonholes, each labelled with a guest\'s name and showing just enough of the topmost note to jog your memory before you pull the whole stack out to read in full.',
          theory:
            'Fetching "my conversations, each with the other participant and the latest message" is more involved than a single straightforward query — a reasonable, course-appropriate approach is two steps: first fetch the current user\'s conversation ids (via `conversation_participants`), then for each, fetch the other participant\'s profile and the single most recent message (`order by created_at desc limit 1`). At LocalInsta\'s scale (a personal or small-community app), this two-step, per-conversation approach is simple and fast enough; a much larger-scale app might reach for a Postgres view or a more elaborate single query — a reasonable, explicitly-noted future optimisation, not required here.\n\nEach row renders the other participant\'s avatar/username, a truncated preview of their latest message, a relative timestamp (`timeago`, Module 5), and (next section) an unread indicator.',
          whyItMatters:
            'This screen is a good, honest example of choosing a "simple and correct, not maximally optimal" implementation deliberately — matching Module 4\'s thumbnail-strategy lesson about scoping complexity to actual need, applied to a query-design decision this time.',
          steps: [
            'Write `fetchMyConversations()` returning a list of `{conversationId, otherParticipant, lastMessage}` records.',
            'For each of the current user\'s conversation ids, fetch the other participant via `conversation_participants` filtered to that conversation and excluding the current user.',
            'Fetch the latest message per conversation with `.order(\'created_at\', ascending: false).limit(1)`.',
            'Build `ConversationsListScreen` rendering each row with avatar, username, message preview, and relative time.',
            'Add an empty state for a user with no conversations yet.',
          ],
          code: `class ConversationSummary {
  const ConversationSummary({required this.conversationId, required this.otherUser, this.lastMessageBody, this.lastMessageAt});
  final String conversationId;
  final PostAuthor otherUser;
  final String? lastMessageBody;
  final DateTime? lastMessageAt;
}

Future<List<ConversationSummary>> fetchMyConversations() async {
  final userId = supabase.auth.currentUser!.id;

  final myConvos = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

  final summaries = <ConversationSummary>[];
  for (final row in myConvos as List) {
    final conversationId = row['conversation_id'] as String;

    final otherRow = await supabase
        .from('conversation_participants')
        .select('profiles(id, username, avatar_url)')
        .eq('conversation_id', conversationId)
        .neq('user_id', userId)
        .single();

    final lastMessageRows = await supabase
        .from('messages')
        .select('body, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', ascending: false)
        .limit(1);

    summaries.add(ConversationSummary(
      conversationId: conversationId,
      otherUser: PostAuthor.fromMap(otherRow['profiles']),
      lastMessageBody: lastMessageRows.isNotEmpty ? lastMessageRows.first['body'] as String : null,
      lastMessageAt: lastMessageRows.isNotEmpty ? DateTime.parse(lastMessageRows.first['created_at']) : null,
    ));
  }

  summaries.sort((a, b) => (b.lastMessageAt ?? DateTime(0)).compareTo(a.lastMessageAt ?? DateTime(0)));
  return summaries;
}`,
          pitfalls: [
            '**Not sorting the final list by most-recent-activity.** A conversations list ordered by conversation creation time (rather than latest message) feels wrong the moment an old thread gets a new reply. Fix: always sort by the most recent message\'s timestamp, as shown.',
            '**Over-engineering this into a single, complex nested query before there is any real evidence it needs to be faster.** For LocalInsta\'s scope, the simpler multi-query approach is genuinely fine — premature optimisation here costs real development time for no measurable benefit at this scale. Fix: ship the simple version; revisit only if real usage demonstrates a need.',
            '**Forgetting `.neq(\'user_id\', userId)` when fetching "the other participant".** Without it, a 1:1 conversation\'s query could return the current user\'s own profile instead of the person they are chatting with. Fix: always exclude the current user explicitly.',
            '**Not handling a conversation with zero messages yet (e.g. immediately after find-or-create, before either side has sent anything).** `lastMessageRows` being empty must be handled gracefully, not assumed non-empty. Fix: the nullable `lastMessageBody`/`lastMessageAt` fields and the empty-list check shown handle this correctly.',
          ],
          tryIt:
            'With two or three test conversations seeded with a few messages each, confirm the list renders correctly ordered by most recent activity, with accurate previews and relative timestamps for each.',
          takeaway: 'A simple, multi-step query is the right, honest choice at this scale — optimise only once real usage demonstrates an actual need.',
        },
        {
          id: 'm8-t6',
          title: 'The chat screen: bubbles & sending',
          explain:
            'A reversed `ListView.builder` of message bubbles (own messages right-aligned, theirs left-aligned), with a bottom input bar — the universally recognised chat layout.',
          analogy:
            'Two stacks of paper chits passed back and forth across a counter, your own chits always landing on your right, the other person\'s on your left — a layout convention so familiar from every messaging app that no explanation is ever needed for a real user.',
          theory:
            '`ListView.builder(reverse: true, ...)` combined with fetching messages **newest-first** is the standard trick for a chat list: setting `reverse: true` means the list visually anchors to the bottom (where the newest message sits) and naturally scrolls upward into history — exactly matching how every chat app behaves, without any manual scroll-position management.\n\nEach `MessageBubble(message, isMine)` renders with `mainAxisAlignment: isMine ? MainAxisAlignment.end : MainAxisAlignment.start` and a differently-coloured `Container` (brand orange for your own messages, neutral grey for theirs) — `isMine` is a simple `message.senderId == currentUserId` comparison. A bottom-anchored `TextField` + send button (Module 5\'s comment-input pattern, reused) submits new messages.',
          whyItMatters:
            'The reversed-list trick is a small, specific piece of Flutter knowledge that solves the "how do chat apps always show newest at the bottom, scrolling up into history" question elegantly — worth having memorised rather than reinventing awkwardly (e.g. with manual `scrollController.jumpTo` calls) each time.',
          steps: [
            'Fetch messages for a conversation ordered **newest-first** (`.order(\'created_at\', ascending: false)`), matching the reversed list.',
            'Build `MessageBubble(message, isMine)` with alignment and colour branching.',
            'Render with `ListView.builder(reverse: true, itemBuilder: ...)`.',
            'Add a bottom `TextField` + send `IconButton`, clearing the field immediately on submit (optimistic pattern, wired fully next topic).',
            'Confirm the list correctly anchors to the newest message at the bottom on first open.',
          ],
          code: `Widget messageBubble(MessageModel m, bool isMine) {
  return Align(
    alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
    child: Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      constraints: BoxConstraints(maxWidth: MediaQuery.of(navigatorKey.currentContext!).size.width * 0.75),
      decoration: BoxDecoration(
        color: isMine ? const Color(0xFFE85A2A) : Colors.grey.shade200,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(m.body, style: TextStyle(color: isMine ? Colors.white : Colors.black87)),
    ),
  );
}

// Chat screen body — reversed list, newest-first data, anchors to the bottom
ListView.builder(
  reverse: true,
  itemCount: messages.length,
  itemBuilder: (context, i) => messageBubble(messages[i], messages[i].senderId == currentUserId),
)`,
          pitfalls: [
            '**Fetching messages oldest-first but forgetting `reverse: true` on the ListView (or vice versa).** The two must match — newest-first data with `reverse: true` anchors correctly to the bottom; mismatching them produces a confusingly upside-down conversation. Fix: always pair newest-first data with a reversed list.',
            '**No `maxWidth` constraint on message bubbles.** A very short message ("ok") stretches to the full screen width, looking wrong compared to real chat apps where bubbles hug their content. Fix: constrain to roughly 70-80% of screen width.',
            '**Using the exact same bubble colour for both senders.** Users cannot tell at a glance who said what without reading carefully. Fix: a clear colour and alignment distinction, as shown.',
            '**Not handling an empty conversation (freshly created, no messages yet) gracefully.** Fix: a simple "Say hello 👋" empty state, encouraging the first message.',
          ],
          tryIt:
            'Open your test conversation with several seeded messages and confirm bubbles correctly alternate sides based on sender, with the newest message visible at the bottom without any manual scrolling.',
          takeaway: 'reverse: true plus newest-first data is the standard trick that makes a chat list behave exactly like every chat app users already know.',
        },
        {
          id: 'm8-t7',
          title: 'Realtime message delivery',
          explain:
            'A Postgres Changes subscription filtered to `conversation_id` streams in new messages from the other participant live — the same filtered-subscription technique from Modules 5 and 7, now powering the feature that needs it most.',
          analogy:
            'A landline that rings the instant someone on the other end starts speaking — chat is the one feature in the entire app where "live" is not a nice-to-have polish detail, it is the entire point of the feature.',
          theory:
            '`supabase.channel(\'messages-for-\$conversationId\').onPostgresChanges(event: PostgresChangeEvent.insert, schema: \'public\', table: \'messages\', filter: PostgresChangeFilter(type: PostgresChangeFilterType.eq, column: \'conversation_id\', value: conversationId), callback: ...).subscribe()` — structurally identical to Module 5\'s filtered comments subscription and Module 7\'s filtered notifications subscription, applied a third time. Exactly like both of those, the incoming event should be **skipped if it is your own just-sent message** (already shown via next topic\'s optimistic send) to avoid a duplicate.\n\n`alter publication supabase_realtime add table public.messages;` is, once again, the easy-to-forget one-time setup step — by this point in the course, this checklist item should feel like a completely familiar, expected part of adding any Realtime feature.',
          whyItMatters:
            'By Module 8, this exact filtered-subscription-plus-skip-own-events pattern has now appeared three times (likes in Module 5, comments in Module 5, notifications in Module 7, and now messages) — a genuinely mastered, transferable Flutter+Supabase skill by this point, not a one-off trick.',
          steps: [
            'Confirm `messages` is added to the Realtime publication.',
            'Open a filtered channel subscription in `ChatState` when the chat screen is opened, scoped to the current `conversationId`.',
            'In the callback, skip the event if `sender_id` matches the current user (already shown optimistically).',
            'Otherwise, parse the new message and prepend it to the (reversed, newest-first) local list.',
            'Always unsubscribe in `dispose()` — chat screens are opened and closed frequently, making leaked subscriptions especially costly here.',
          ],
          code: `-- alter publication supabase_realtime add table public.messages;

RealtimeChannel? _channel;

void startListening(String conversationId, String currentUserId) {
  _channel = supabase
      .channel('messages-for-\$conversationId')
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'messages',
        filter: PostgresChangeFilter(
          type: PostgresChangeFilterType.eq,
          column: 'conversation_id',
          value: conversationId,
        ),
        callback: (payload) {
          final row = payload.newRecord;
          if (row['sender_id'] == currentUserId) return; // already shown optimistically
          final incoming = MessageModel.fromMap(row);
          messages = [incoming, ...messages]; // newest-first list
          notifyListeners();
        },
      )
      .subscribe();
}

@override
void dispose() {
  if (_channel != null) supabase.removeChannel(_channel!);
  super.dispose();
}`,
          pitfalls: [
            '**Forgetting the publication step, yet again — a mistake worth actively guarding against by now.** Fix: keep the running Realtime-tables checklist from Module 5 up to date; `messages` is the fourth entry.',
            '**Not skipping the sender\'s own message in the callback.** Produces a visible duplicate bubble, the exact same mistake Module 5\'s comments topic warned against — now with higher stakes, since chat duplicates are more jarring than an occasional feed inconsistency.',
            '**Subscribing to the entire `messages` table with no filter, across every conversation in the app.** At any real scale, this delivers every LocalInsta user\'s private messages to every open chat screen\'s subscription logic, filtered client-side after the fact — both wasteful and a subtle information-exposure smell (even if client-side filtering happens to hide it correctly). Fix: always filter at the subscription level for chat, without exception.',
            '**Not unsubscribing promptly when leaving a chat screen.** Chat screens open and close far more often than most other screens in the app, making a leaked-subscription habit compound quickly across a session. Fix: rigorous `dispose()` discipline here especially.',
          ],
          tryIt:
            'With two test accounts on two devices, open the same conversation on both, send a message from device A, and confirm it appears live on device B within a second or two, with no duplicate on device A itself.',
          takeaway: 'The filtered-subscription-plus-skip-own-events pattern, now used a fourth time, should feel like a fully mastered, reusable skill rather than new territory.',
        },
        {
          id: 'm8-t8',
          title: 'Optimistic send with a pending/failed state',
          explain:
            'A sent message appears instantly with a subtle "sending..." indicator, confirmed once the real insert succeeds, or marked "failed — tap to retry" if it does not.',
          analogy:
            'Dropping a letter in a post box: you know instantly that you sent it (it is out of your hands), but the little added confidence of a delivery confirmation — or a returned-to-sender notice if something went wrong — comes a little later.',
          theory:
            'This is Module 5\'s optimistic-comment pattern, applied to chat, with one small but meaningful addition: a **three-state** message status (`sending`, `sent`, `failed`) rendered subtly in the bubble (a small clock icon while sending, nothing extra once confirmed, a red retry icon on failure) — because chat messages, unlike comments, are frequent enough and important enough to users that a silent, invisible failure would be a genuinely bad experience.\n\nOn submit: build a temporary local `MessageModel` with `status: sending`, prepend it immediately, clear the input. Fire the real insert in the background. On success, swap the temporary message for the real one (`status: sent`, matching Module 5\'s comment-reconciliation pattern). On failure, keep the message visible but mark it `status: failed`, with a tap-to-retry affordance rather than silently removing it (removing a message the user believes they already sent would be more confusing than showing a clear failure state).',
          whyItMatters:
            'This is a small but genuine refinement over Module 5\'s comment pattern — recognising that "remove on failure" (right for a comment) and "mark as failed, keep visible, offer retry" (right for a message someone is actively waiting on) are different, deliberately chosen responses to the same underlying optimistic-UI problem.',
          steps: [
            'Add a `MessageStatus { sending, sent, failed }` enum to `MessageModel`.',
            'On submit, build and prepend a `sending`-status temporary message, clear the input immediately.',
            'Fire the real insert; on success, swap the temporary message for the real, database-confirmed one with `status: sent`.',
            'On failure, update the temporary message\'s status to `failed` in place — do not remove it.',
            'Render a small status icon per bubble: a clock for `sending`, nothing for `sent`, a red retry icon (tappable to resend the same body) for `failed`.',
          ],
          code: `enum MessageStatus { sending, sent, failed }

Future<void> sendMessage(String conversationId, String body) async {
  final tempId = 'temp-\${DateTime.now().microsecondsSinceEpoch}';
  final optimistic = MessageModel(
    id: tempId,
    conversationId: conversationId,
    senderId: currentUserId,
    body: body,
    createdAt: DateTime.now(),
    status: MessageStatus.sending,
  );
  messages = [optimistic, ...messages];
  notifyListeners();

  try {
    final row = await supabase
        .from('messages')
        .insert({'conversation_id': conversationId, 'sender_id': currentUserId, 'body': body})
        .select()
        .single();
    final confirmed = MessageModel.fromMap(row).copyWith(status: MessageStatus.sent);
    messages = messages.map((m) => m.id == tempId ? confirmed : m).toList();
  } catch (e) {
    messages = messages.map((m) => m.id == tempId ? m.copyWith(status: MessageStatus.failed) : m).toList();
  } finally {
    notifyListeners();
  }
}

// Retry — re-sends the exact same body under a fresh temporary id
Future<void> retryMessage(MessageModel failed) async {
  messages = messages.where((m) => m.id != failed.id).toList();
  await sendMessage(failed.conversationId, failed.body);
}`,
          pitfalls: [
            '**Silently removing a failed message, exactly matching Module 5\'s comment pattern without adjusting for chat\'s different stakes.** A user who typed a real message and watched it vanish with no explanation is genuinely more frustrated than one whose comment quietly did not post. Fix: mark failed messages visibly, offer retry, never silently remove.',
            '**Not clearing the input field until the network call resolves.** The exact same laggy-feeling mistake Module 5 already warned against, now in a context where responsiveness matters even more. Fix: clear immediately on submit.',
            '**Forgetting to also handle the temporary-id-to-real-id swap correctly if a Realtime event for this exact message arrives before the insert\'s own response does (a genuine possible race).** A reasonable, small edge case to be aware of; acceptable to leave unhandled for this course\'s scope since the "skip own sender_id" check from the previous topic already prevents an actual duplicate, even if the ordering of which update "wins" varies.',
            '**Not giving retry a fresh temporary id, reusing the failed one.** Can create confusing state if the retry itself also fails and both updates target the same key. Fix: treat retry as removing the failed message and calling `sendMessage` fresh, as shown.',
          ],
          tryIt:
            'Send a normal message and confirm it shows a brief sending indicator before settling into a plain confirmed bubble; then turn on airplane mode, send another, confirm it shows the failed/retry state, turn connectivity back on, tap retry, and confirm it sends successfully.',
          takeaway: 'Chat messages deserve a visible failed state with retry, not silent removal — a deliberate, context-appropriate variation on Module 5\'s optimistic pattern.',
        },
      ],
    },
    {
      id: 'm8-s3',
      title: 'Read receipts, unread badges & presence',
      topics: [
        {
          id: 'm8-t9',
          title: 'Read receipts via last_read_at',
          explain:
            'A `last_read_at` timestamp per participant, updated whenever they view a conversation, is enough to derive both "has the other person seen this" and "how many messages are unread" without a per-message read flag.',
          analogy:
            'A library due-date stamp recording only the *last* time you visited, not a separate checkmark next to every single book you glanced at — one timestamp, compared against when each book was shelved, tells the whole story.',
          theory:
            'Add `last_read_at timestamptz` to `conversation_participants` (nullable — null means "never opened this conversation"). Whenever a user opens or is actively viewing a conversation, update their own row: `supabase.from(\'conversation_participants\').update({\'last_read_at\': DateTime.now().toIso8601String()}).eq(\'conversation_id\', conversationId).eq(\'user_id\', currentUserId)`, protected by a narrow RLS `update` policy (mirroring Module 7\'s notifications `read` policy: a participant may only update their own `last_read_at`, nothing else, on their own row).\n\n"Has the other person read my last message" is then a derived comparison, not a stored flag: `otherParticipant.lastReadAt != null && otherParticipant.lastReadAt.isAfter(myLastMessage.createdAt)`. This single-timestamp approach is deliberately simpler than a per-message `read_by` table, and — since read receipts only ever need to answer "as of now, has this conversation been seen past this point", not "exactly which individual messages were read" — it loses no information LocalInsta actually needs.',
          whyItMatters:
            'This is another instance of the Module 4 thumbnail-strategy lesson: picking the simplest data model that genuinely answers the real product question, rather than the most granular one imaginable, is itself a skill worth practicing deliberately.',
          steps: [
            'Add `last_read_at timestamptz` to `conversation_participants`.',
            'Add a narrow RLS update policy: `to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)`, scoped to this table.',
            'Call the update whenever the chat screen opens and whenever a new message is received while it is open.',
            'Derive a "Seen" label under your own last sent message by comparing the other participant\'s `last_read_at` against that message\'s `created_at`.',
            'Test across two devices: send a message from A, open the conversation on B, confirm A sees "Seen" appear.',
          ],
          code: `alter table public.conversation_participants add column last_read_at timestamptz;

create policy "participants update their own read timestamp"
on public.conversation_participants for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

Future<void> markConversationRead(String conversationId) async {
  await supabase
      .from('conversation_participants')
      .update({'last_read_at': DateTime.now().toIso8601String()})
      .eq('conversation_id', conversationId)
      .eq('user_id', supabase.auth.currentUser!.id);
}

bool hasBeenSeen({required DateTime? otherLastReadAt, required DateTime myMessageCreatedAt}) {
  return otherLastReadAt != null && otherLastReadAt.isAfter(myMessageCreatedAt);
}`,
          pitfalls: [
            '**Building a per-message `read_by` join table before confirming the simpler timestamp approach is actually insufficient.** More schema, more triggers, more complexity for a level of granularity ("exactly which messages", not just "read up to when") LocalInsta never actually needs. Fix: start with the single-timestamp model; only add per-message granularity if a real requirement demands it.',
            '**Forgetting the RLS update policy is scoped narrowly to your own row, not any row in the table.** Without the `using (auth.uid() = user_id)` clause, any participant could rewrite anyone\'s `last_read_at`. Fix: always scope this kind of "update my own status" policy tightly, exactly like Module 7\'s notification-read policy.',
            '**Only updating `last_read_at` on initial screen open, not also as new messages arrive while the screen stays open.** A user actively chatting would show as "not having read" the newest incoming messages until they navigate away and back. Fix: also call the update whenever a new message is received via Realtime while the screen is visible.',
            '**Treating a `null` `last_read_at` as "read long ago" instead of "never read".** Fix: always explicit-null-check, as shown, rather than assuming any timestamp comparison is safe.',
          ],
          tryIt:
            'Send a message from account A, then open the conversation from account B\'s device, and confirm account A\'s view of that message updates to show a "Seen" indicator shortly after — either via a manual refresh or (a natural stretch) a Realtime subscription on `conversation_participants` too.',
          takeaway: 'A single last_read_at timestamp per participant answers every read-receipt question LocalInsta actually needs — no per-message tracking required.',
        },
        {
          id: 'm8-t10',
          title: 'The unread conversations badge',
          explain:
            'A conversation is "unread" if its latest message is newer than the current user\'s own `last_read_at` for that conversation — the same badge pattern from Module 7, now derived rather than stored.',
          analogy:
            'Noticing a shop\'s shutter has a fresh chalk mark added since you last walked past — you do not need someone to separately tell you "there is something new here", the comparison between two simple facts (when it was marked, when you last looked) tells you directly.',
          theory:
            'Unlike Module 7\'s stored `read` boolean on each notification row, a conversation\'s unread status is **derived** at query/display time: `conversation.lastMessage.createdAt.isAfter(myParticipantRow.lastReadAt ?? DateTime(0))` — no extra column or trigger needed, since Module 8\'s `last_read_at` and Module 8\'s message timestamps already contain everything required. The conversations-list screen (this module\'s earlier topic) can compute this per row and render a small unread dot; the bottom-nav badge count is simply the count of conversations currently satisfying this comparison.\n\nThis is a deliberate, worthwhile contrast with Module 7\'s approach: sometimes a stored flag (notifications\' `read` boolean, updated explicitly) is the right tool; sometimes a value **derived** from data you already have (chat\'s unread state) is simpler and avoids an extra column and extra writes entirely. Recognising which situation calls for which is a genuine modeling skill.',
          whyItMatters:
            'This topic is explicitly a compare-and-contrast with Module 7\'s notification badge — both solve "show me an unread count", via two different, both-correct approaches, chosen deliberately based on what data was already available.',
          steps: [
            'Add a computed `isUnread` getter/comparison wherever `ConversationSummary` (this module\'s earlier topic) is rendered, comparing `lastMessageAt` against the current user\'s own `last_read_at` for that conversation.',
            'Render a small unread dot/bold styling on unread conversation rows.',
            'Compute the total unread conversation count for the Messages tab\'s badge (if LocalInsta adds a sixth nav destination, or folds messaging into an existing tab — a reasonable app-structure decision left to you).',
            'Test: receive a message in a conversation you have not opened recently, confirm it shows as unread; open it, confirm it clears.',
          ],
          code: `bool isConversationUnread({
  required DateTime? lastMessageAt,
  required DateTime? myLastReadAt,
}) {
  if (lastMessageAt == null) return false; // no messages yet — nothing to be unread
  return myLastReadAt == null || lastMessageAt.isAfter(myLastReadAt);
}

// Total unread badge count — no extra query needed beyond what
// fetchMyConversations() already returns, since it can also carry
// each conversation's own last_read_at alongside the last message.
int unreadConversationCount(List<ConversationSummary> conversations) {
  return conversations.where((c) => isConversationUnread(
    lastMessageAt: c.lastMessageAt,
    myLastReadAt: c.myLastReadAt,
  )).length;
}`,
          pitfalls: [
            '**Adding a stored `unread` boolean column "for consistency with notifications", when a derived comparison is simpler and needs no extra writes to keep in sync.** Fix: recognise when derivation genuinely beats storage — here, all the needed data already exists.',
            '**Forgetting the "no messages yet" case (`lastMessageAt == null`).** A freshly created, empty conversation should never show as unread. Fix: explicit early return, as shown.',
            '**Computing this only client-side from a full conversations fetch, without considering it should also update live as new messages arrive via Realtime while the list screen is open.** A reasonable, small gap to accept for this course\'s scope, or extend with a Realtime subscription on `messages` scoped more broadly — a natural stretch.',
            '**Confusing this per-conversation unread check with Module 7\'s per-notification read flag, applying the wrong pattern to the wrong table out of habit.** Fix: deliberately choose the right tool per table\'s actual situation, as this topic\'s theory emphasises.',
          ],
          tryIt:
            'From a second test account, send a message into a conversation, confirm it shows as unread on the recipient\'s conversations list, open it, and confirm it correctly clears back to "read" without any additional stored flag ever being written.',
          takeaway: 'Sometimes a derived comparison beats a stored flag — recognising which situation calls for which is a real modeling skill, not just a style preference.',
        },
        {
          id: 'm8-t11',
          title: 'A typing indicator with Supabase Presence',
          explain:
            'Supabase Realtime\'s Presence feature — distinct from the Postgres Changes used everywhere else this course — broadcasts ephemeral "who is currently here and what are they doing" state, perfect for a typing indicator.',
          analogy:
            'A shop assistant seeing a customer\'s hand hovering over a bell has a genuinely different kind of information than reading yesterday\'s sales ledger — one is a permanent record of what happened, the other is fleeting, live awareness of what is happening *right now*, gone the moment it stops being true.',
          theory:
            '**Presence** is Supabase Realtime\'s mechanism for tracking ephemeral, non-database state shared between clients subscribed to the same channel — unlike **Postgres Changes** (used throughout Modules 5, 7, and earlier this module), which streams real, permanent database row events, Presence never touches a table at all. `channel.track({\'typing\': true})` broadcasts your own ephemeral state to everyone else on the same channel; `channel.onPresenceSync(...)` / `.onPresenceJoin(...)` lets you read everyone else\'s current broadcast state.\n\nFor a typing indicator: on every keystroke in the message input, call `channel.track({\'typing\': true})`, debounced (Module 6\'s technique, reused) so it does not fire on every single character; after a short pause with no further keystrokes, `channel.track({\'typing\': false})`. The other participant\'s chat screen listens for this state and shows a small "typing..." indicator whenever it sees `typing: true` from the other participant, disappearing automatically the moment that state changes back.',
          whyItMatters:
            'Presence is genuinely different from every other Realtime technique in this course — recognising *when* ephemeral, non-persisted state (typing, "who\'s currently online") is the right tool, versus a real database row (a message, a like), is an important distinction most Firebase-based courses in this portfolio never get to cover, since Firestore has no exact equivalent this clean.',
          steps: [
            'Open a Presence-enabled channel per conversation, separate from (or alongside) the Postgres Changes channel from earlier this module.',
            'On message-input keystroke, debounced, call `channel.track({\'typing\': true, \'user_id\': currentUserId})`.',
            'After ~2 seconds of no further keystrokes, call `channel.track({\'typing\': false, ...})`.',
            'Listen for the other participant\'s presence state via `onPresenceSync`, showing/hiding a "typing..." indicator accordingly.',
            'Test across two devices: type in the input on device A (without sending), confirm "typing..." appears live on device B, and disappears a couple of seconds after you stop.',
          ],
          code: `final presenceChannel = supabase.channel(
  'typing-in-\$conversationId',
  opts: const RealtimeChannelConfig(self: false),
);

Timer? _typingDebounce;

void onInputChanged(String text) {
  presenceChannel.track({'typing': true, 'user_id': currentUserId});

  _typingDebounce?.cancel();
  _typingDebounce = Timer(const Duration(seconds: 2), () {
    presenceChannel.track({'typing': false, 'user_id': currentUserId});
  });
}

presenceChannel
  .onPresenceSync((payload) {
    final states = presenceChannel.presenceState();
    final otherIsTyping = states.any((s) =>
        s.presences.any((p) => p.payload['user_id'] != currentUserId && p.payload['typing'] == true));
    // update local UI state to show/hide the "typing..." indicator
  })
  .subscribe();`,
          pitfalls: [
            '**Calling `track()` on every single keystroke with no debounce.** Floods the channel with redundant broadcasts. Fix: debounce exactly like Module 6\'s search input, just with a shorter window appropriate to typing feedback (1-2 seconds is typical).',
            '**Forgetting to ever send `typing: false`.** The indicator would show "typing..." forever after the first keystroke, never clearing even once the user stops or sends the message. Fix: always pair the debounced "stopped typing" signal, and also clear it explicitly the moment a message actually sends.',
            '**Confusing Presence with Postgres Changes and expecting typing state to persist or be queryable from a table.** It is deliberately ephemeral — closing the channel (leaving the chat screen) simply loses it, by design, which is exactly correct for this kind of transient signal. Fix: never reach for Presence when you actually need a permanent record — that is what Postgres Changes and a real table are for.',
            '**Not cleaning up the presence channel on screen dispose, alongside the messages channel.** Fix: unsubscribe both channels together in `dispose()`.',
          ],
          tryIt:
            'With two test devices in the same conversation, type a few characters on device A without sending, confirm "typing..." appears on device B within a second, stop typing, and confirm it disappears a couple of seconds later without ever sending a message.',
          takeaway: 'Presence broadcasts ephemeral, non-persisted state between live clients — a genuinely different tool from Postgres Changes, reserved for signals that should vanish the moment they stop being true.',
        },
      ],
    },
    {
      id: 'm8-s4',
      title: 'Chat performance & moderation',
      topics: [
        {
          id: 'm8-t12',
          title: 'Paginating chat history',
          explain:
            'A long-running conversation eventually needs the same range-based pagination technique from Module 5\'s feed, loading older messages as the user scrolls up rather than fetching the entire history at once.',
          analogy:
            'Pulling out only the most recent pages of a thick ledger book to start, fetching earlier pages from the archive shelf only if someone actually flips back far enough to need them — not hauling the entire multi-year ledger onto the counter for every single glance.',
          theory:
            'A reversed `ListView.builder` (this module\'s earlier topic) scrolling **up** into history is the mirror image of Module 5\'s feed scrolling **down** into more recent content — the same `ScrollController` near-threshold pattern applies, just triggering "load older messages" (`.range()` continuing further back in `created_at desc` order) when the user nears the *top* of the reversed list instead of the bottom.\n\nAt LocalInsta\'s course scale, an initial fetch of the most recent ~50 messages, with pagination triggered only for genuinely long-running conversations, is a proportionate choice — directly reusing Module 5\'s pagination logic rather than inventing a new technique.',
          whyItMatters:
            'This topic is one more confirmation of how much Module 5\'s pagination investment pays for itself throughout the rest of the course — a fourth or fifth reuse of the same core technique by this point.',
          steps: [
            'Change the initial message fetch to `.range(0, 49)` (the most recent 50), still ordered newest-first.',
            'Add a `ScrollController` listener checking proximity to the top of the reversed list (which visually corresponds to the *oldest*-loaded end).',
            'On trigger, fetch the next older page via `.range(50, 99)`, appending (not prepending — mind the direction given the reversed list) to the message list.',
            'Guard against overlapping in-flight loads and track a `hasMoreHistory` flag, exactly mirroring Module 5\'s `hasMore`.',
            'Test with a conversation seeded with 60+ messages, confirming older history loads smoothly while scrolling up.',
          ],
          code: `// Mirrors Module 5's feed pagination almost exactly, adapted for a
// reversed list scrolling toward older history instead of newer content.
Future<void> loadOlderMessages(String conversationId) async {
  if (isLoadingMore || !hasMoreHistory) return;
  isLoadingMore = true;
  notifyListeners();

  final nextPage = await supabase
      .from('messages')
      .select()
      .eq('conversation_id', conversationId)
      .order('created_at', ascending: false)
      .range(messages.length, messages.length + 49);

  final older = (nextPage as List).map((r) => MessageModel.fromMap(r)).toList();
  messages = [...messages, ...older]; // appended — these are OLDER, further down the reversed list
  hasMoreHistory = older.length == 50;
  isLoadingMore = false;
  notifyListeners();
}`,
          pitfalls: [
            '**Fetching the entire conversation history on every chat screen open, "since it is just messages".** Exactly the same mistake Module 5 warned against for the feed, now costing more given how much longer-lived a busy conversation can grow. Fix: paginate from the start, even here.',
            '**Getting the append/prepend direction backward in a reversed list.** Because the list is reversed, "older messages" genuinely belong appended to the end of the underlying data array, not prepended — easy to get turned around. Fix: reason carefully about which visual direction maps to which array operation, and test explicitly.',
            '**Not reusing the exact `isLoadingMore`/`hasMore` guard pattern from Module 5.** Reinventing it slightly differently here risks a subtly different, harder-to-spot bug. Fix: copy the proven pattern deliberately.',
            '**Triggering the older-history load exactly at the scroll edge instead of with a threshold buffer.** The same UX lag Module 5 already solved with an early-trigger threshold. Fix: apply the identical buffer technique.',
          ],
          tryIt:
            'Seed a test conversation with 60+ messages, open the chat screen, confirm only the most recent 50 load initially, then scroll up and confirm older messages load smoothly with no visible stutter or duplication.',
          takeaway: 'Chat pagination is Module 5\'s feed pagination, mirrored for a reversed list scrolling toward history instead of newer content — the same proven technique, a new direction.',
        },
        {
          id: 'm8-t13',
          title: 'Leaving a conversation',
          explain:
            'A simple per-participant "leave" removes your own `conversation_participants` row, hiding the conversation from your own list without deleting it (or its messages) for the other participant.',
          analogy:
            'Taking your name off a shared noticeboard subscription list without tearing the board itself down — the other subscriber keeps seeing every notice as before; only your own name is gone from the list.',
          theory:
            '`supabase.from(\'conversation_participants\').delete().eq(\'conversation_id\', conversationId).eq(\'user_id\', currentUserId)` removes only the current user\'s own participation row — protected by an RLS `delete` policy scoped to `auth.uid() = user_id` (a pattern by now thoroughly familiar from every ownership-scoped delete this course has built). The conversation, its messages, and the *other* participant\'s row are untouched — from the other person\'s perspective, nothing has changed; from the leaving user\'s perspective, the conversation simply no longer appears in `fetchMyConversations()`, since that query is itself scoped to the current user\'s own participant rows.\n\nThis is a deliberately simple, **per-participant** notion of "deleting" a conversation — no shared "delete for everyone" concept exists in LocalInsta\'s design, matching how most real chat apps actually behave (deleting a conversation on your device does not delete it for the other person).',
          whyItMatters:
            'This is a satisfying, low-effort final topic that mostly reuses RLS and query patterns established many times over across this module and the course as a whole — proof that a well-designed schema (Module 8\'s opening topic) makes even a feature that sounds complex ("delete a conversation") turn out to be a single, simple, already-secured delete call.',
          steps: [
            'Add a `delete` RLS policy on `conversation_participants`, scoped to `auth.uid() = user_id`.',
            'Add a "Leave conversation" action (with a confirmation dialog, mirroring every other destructive action in this course) on the chat screen.',
            'Call the delete on confirm, then pop back to the conversations list.',
            'Confirm the conversation genuinely disappears from the leaving user\'s `fetchMyConversations()` result, while the other participant\'s view (and the underlying messages) are entirely unaffected.',
          ],
          code: `create policy "participants can leave their own conversations"
on public.conversation_participants for delete
to authenticated
using (auth.uid() = user_id);

Future<void> leaveConversation(String conversationId) async {
  await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', supabase.auth.currentUser!.id);
}`,
          pitfalls: [
            '**Deleting the entire `conversations` row instead of just the current user\'s participant row.** Would (via `on delete cascade`) destroy the conversation and every message for the *other* participant too — a serious, unintended data-loss bug from a single user\'s "leave" action. Fix: only ever delete your own participant row.',
            '**No confirmation dialog before leaving.** Loses access to the entire conversation history (from this user\'s side) on an accidental tap. Fix: confirm before any destructive/disruptive action, exactly matching every other such flow across this course.',
            '**Not considering what should happen if the *other* participant later sends a new message into a conversation you have left.** A reasonable, explicit product decision to make rather than an accidental gap — LocalInsta\'s find-or-create logic (this module\'s earlier topic) would simply create a *new* conversation between the pair if invoked again, since the old one no longer has you as a participant, which is a sensible, if worth-noting, consequence.',
            '**Forgetting this delete still needs the RLS policy from this topic — nothing works without it, exactly matching the default-deny discipline from every earlier module.**',
          ],
          tryIt:
            'Leave a test conversation from one account, confirm it disappears from that account\'s conversations list, then check from the *other* test account that the conversation and every message are completely unaffected and still fully visible.',
          takeaway: 'Leaving a conversation is a single, already-secured delete of your own participant row — proof that a well-designed schema makes even a feature that sounds complex genuinely simple to implement correctly.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Project',
      title: 'A Complete Real-Time Chat System',
      domain: 'Chat / Realtime / Presence',
      duration: '3.5 hours',
      description:
        'Build the full DM feature: the conversations/participants/messages schema with subquery-based RLS, a find-or-create RPC, a conversations list, a reversed chat screen with optimistic three-state sending, live Realtime delivery, read receipts, and an unread badge.',
      tools: ['Flutter', 'supabase_flutter', 'provider'],
      blueprint: {
        overview:
          'A production-feeling 1:1 chat: conversations and conversation_participants tables secured by subquery-based participancy RLS policies, a find_or_create_conversation RPC preventing duplicate threads, a conversations list showing the latest message per thread, a reversed chat screen with sending/sent/failed message states, filtered Realtime delivery skipping own events, and read receipts plus an unread badge derived from a single last_read_at timestamp.',
        functionalRequirements: [
          '**Schema + RLS.** conversations, conversation_participants, messages, all secured by participancy subqueries — verified via impersonation to genuinely block non-participants.',
          '**Find-or-create.** An atomic RPC that never creates duplicate 1:1 conversations for the same pair.',
          '**Conversations list.** Latest message preview per thread, sorted by recency, with an unread indicator.',
          '**Chat screen.** Reversed, newest-first bubbles, optimistic send with sending/sent/failed states and retry.',
          '**Realtime.** Filtered delivery per conversation_id, skipping the sender\'s own events.',
          '**Read receipts.** A single last_read_at per participant, driving both a "Seen" label and the unread badge.',
        ],
        technicalImplementation: [
          '**supabase/migrations/0008_chat.sql.** All three tables, every RLS policy, the find_or_create_conversation function, and the last_read_at column + its update policy.',
          '**features/chat/data/{chat_repository.dart, conversation_summary.dart, message_model.dart}.**',
          '**features/chat/state/{conversations_list_state.dart, chat_state.dart}.** Realtime lifecycle, optimistic send, presence-based typing (optional stretch within this project).',
          '**features/chat/presentation/{conversations_list_screen.dart, chat_screen.dart}.**',
        ],
        prompts: [
          {
            step: 1,
            label: 'Schema, subquery RLS, and find-or-create',
            outcome: 'A fully secured chat backend, verified against non-participants.',
            prompt:
              'Write supabase/migrations/0008_chat.sql: conversations, conversation_participants (composite primary key, last_read_at column), and messages tables with appropriate indexes; RLS policies on all three using exists(...) subqueries against conversation_participants to check participancy (select on conversations and messages, insert on messages requiring both participancy and sender_id = auth.uid(), select and a last_read_at-scoped update on conversation_participants, delete on conversation_participants scoped to your own row); and a security invoker find_or_create_conversation(other_user_id) function that finds an existing exact-pair conversation or atomically creates one. Include an impersonation verification block proving a non-participant cannot read a conversation\'s messages.',
          },
          {
            step: 2,
            label: 'Conversations list + starting a chat',
            outcome: 'A working list screen and a "Message" button on profiles.',
            prompt:
              'Create lib/features/chat/data/chat_repository.dart with fetchMyConversations() (per-conversation other-participant + latest message + last_read_at lookup, sorted by recency) and startConversationWith(otherUserId) calling the find_or_create_conversation RPC. Build lib/features/chat/presentation/conversations_list_screen.dart rendering ConversationSummary rows with avatar, username, message preview, relative timestamp, and an unread indicator derived by comparing lastMessageAt to myLastReadAt. Add a "Message" button on ProfileScreen (Module 6) for non-own profiles, calling startConversationWith and navigating to the chat screen.',
          },
          {
            step: 3,
            label: 'Chat screen: bubbles, optimistic send, Realtime',
            outcome: 'A fully working, live-updating chat screen.',
            prompt:
              'Build lib/features/chat/state/chat_state.dart with a reversed, newest-first message list, sendMessage (optimistic three-state: sending -> sent/failed, with retryMessage on failure), and a filtered Realtime Postgres Changes subscription on messages scoped to conversation_id (skipping the current user\'s own sender_id), unsubscribed in dispose. Build lib/features/chat/presentation/chat_screen.dart with a reversed ListView.builder of message bubbles (right-aligned brand-colored for own messages, left-aligned grey for the other participant, status icon for sending/failed) and a bottom input bar. Remind me to run alter publication supabase_realtime add table public.messages;.',
          },
          {
            step: 4,
            label: 'Read receipts and the unread badge',
            outcome: 'A working "Seen" indicator and an accurate unread count.',
            prompt:
              'Wire markConversationRead(conversationId) to fire when the chat screen opens and whenever a new message arrives via Realtime while it is open. Add a "Seen" label under the sender\'s last message when the other participant\'s last_read_at is after that message\'s created_at. Compute an unreadConversationCount from fetchMyConversations() results for use as a badge, following the same derived (not stored) approach described in this module.',
          },
        ],
        deliverable:
          'A working chat system: starting a conversation from a profile never creates duplicates, messages send instantly with a visible pending state and arrive live on a second device within a couple of seconds, a failed send (tested via airplane mode) shows a working retry, "Seen" appears correctly once the other side opens the thread, and a non-participant genuinely cannot read the conversation even with the id in hand.',
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'Why does LocalInsta model chat as separate conversations and conversation_participants tables instead of a simple messages(sender_id, recipient_id) pair?',
      options: [
        'It lets a future group-chat feature be an additive change instead of a painful schema rewrite',
        'Supabase requires at least two tables for any chat feature',
        'It makes RLS unnecessary for the messages table',
        'It is required for Realtime subscriptions to work at all',
      ],
      answer: 0,
    },
    {
      id: 'm8-q2',
      q: 'Why can\'t the messages table\'s RLS select policy simply compare a single column to auth.uid(), the way posts and likes do?',
      options: [
        'A message row does not itself list who is allowed to read it — that requires a subquery checking participancy in the related conversation',
        'Postgres does not support column comparisons in RLS policies',
        'Messages do not need RLS since they are always private by default',
        'It is a stylistic choice with no functional difference',
      ],
      answer: 0,
    },
    {
      id: 'm8-q3',
      q: 'Why does find_or_create_conversation need to be a single atomic database function rather than two or three separate calls from Flutter?',
      options: [
        'It prevents a race where two rapid taps could create two separate duplicate conversations between the same pair',
        'Supabase does not allow multiple inserts from a Flutter app',
        'It is required for the RLS policies to apply at all',
        'It makes the conversation load faster on the client',
      ],
      answer: 0,
    },
    {
      id: 'm8-q4',
      q: 'In the optimistic chat-send pattern, why does a failed message stay visible with a retry option instead of being silently removed like a failed comment in Module 5?',
      options: [
        'Chat messages are frequent and high-stakes enough that silently vanishing would be more confusing than a visible failed state',
        'Supabase requires failed messages to remain in the UI',
        'Removing a message would violate Row Level Security',
        'There is no real difference; both should behave identically',
      ],
      answer: 0,
    },
    {
      id: 'm8-q5',
      q: 'Why does LocalInsta use a single last_read_at timestamp per participant instead of a per-message read_by table?',
      options: [
        'It answers every read-receipt question the app actually needs (has this been seen up to this point) with much less schema and write complexity',
        'Per-message read tracking is not possible in Postgres',
        'A single timestamp is required for RLS to function',
        'It makes messages send faster',
      ],
      answer: 0,
    },
    {
      id: 'm8-q6',
      q: 'Why is Supabase Presence the right tool for a typing indicator, rather than inserting rows into a database table via Postgres Changes?',
      options: [
        'Typing state is ephemeral and should vanish the moment it stops being true, which is exactly what Presence provides without touching persistent storage',
        'Presence is faster than Postgres Changes for every use case',
        'Postgres Changes cannot be filtered by conversation',
        'Typing indicators require a paid Supabase plan',
      ],
      answer: 0,
    },
  ],
}

export const displayName = (member, user) =>
  (member?.displayName ?? user.username).replace(/[<>@`\n\r]/g, '').slice(0, 32) || 'someone';

// Last N channel messages as text, plus the names of the humans who spoke.
export async function buildChatLog(channel, { limit = 15, botId }) {
  let msgs = [];
  try {
    const fetched = await channel.messages?.fetch?.({ limit });
    if (fetched) msgs = [...fetched.values()].reverse(); // oldest first
  } catch {
    // If bot lacks "Read Message History" permission, proceed without chat context
    return { log: '', participants: [] };
  }
  const people = new Set();
  let text = '';
  for (const m of msgs) {
    if (!m.content?.trim()) continue;
    const isMe = m.author.id === botId;
    if (m.author.bot && !isMe) continue;
    const name = isMe ? 'CHADBOT' : displayName(m.member, m.author);
    if (!isMe) people.add(name);
    text += `${name}: ${m.cleanContent.slice(0, 300)}\n`;
  }
  return { log: text.slice(-6000), participants: [...people] };
}

// botTurns = how many of those messages were CHADBOT's, used for the loop cap.
export async function buildThread(message, botId, max = 6) {
  const chain = [];
  let cur = message;
  for (let i = 0; i < max && cur.reference?.messageId; i++) {
    try { cur = await cur.fetchReference(); } catch { break; }
    chain.unshift(cur);
  }
  const lines = chain.map((m) => {
    const who = m.author.id === botId ? 'CHADBOT' : displayName(m.member, m.author);
    return `${who}: ${m.cleanContent.slice(0, 300)}`;
  });
  return { thread: lines.join('\n'), botTurns: chain.filter((m) => m.author.id === botId).length };
}
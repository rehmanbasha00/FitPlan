// Canned replies used to simulate the other participant responding in real
// time. This keeps the demo chat feeling like a live two-way conversation
// without needing a second real user or a WebSocket server.
const GENERIC_REPLIES = [
  "Sounds good, count me in!",
  "Haha yes, let's do it 😄",
  "I'll check my schedule and confirm tonight.",
  "Can we push it an hour later?",
  "Sending you the details in a bit.",
  "That works for me 👍",
  "Let me ask the others too.",
  "Perfect, see you then!",
  "I'm so excited for this one.",
  "Can you share the location again?"
];

export function pickAutoReply(_participantName: string) {
  return GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)];
}

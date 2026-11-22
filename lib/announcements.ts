// "What's new" entries shown in the Inbox under Updates.
// Newest first. Add an entry here when you ship something users should know about.
export interface Announcement {
  id: string
  title: string
  body: string
  date: string // YYYY-MM-DD
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "2026-11-new-navigation",
    title: "A new home for everything",
    body: "Stats, achievements, social, leaderboards, your inbox and settings now live in the ☰ menu at the top-left.",
    date: "2026-11-22",
  },
  {
    id: "2026-11-system-preview",
    title: "Coming soon: System",
    body: "Map your rooms with shapes, then pin items and tasks to furniture. Find it in the System tab.",
    date: "2026-11-22",
  },
]

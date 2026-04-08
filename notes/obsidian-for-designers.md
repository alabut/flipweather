# Obsidian for Semi-Technical Designers

#obsidian #tools #setup

For people who know HTML/CSS, can read code, work alongside engineers, and have zero patience for tools that look like code editors.

---

## Why it looked bad the first time

Obsidian's default theme is dark, dense, and renders markdown as raw syntax while you're typing. It looks exactly like VS Code with a notes plugin. That's a fair reaction to have and a reason many designers bounce off it.

The fix is two settings changes, not a learning curve.

**1. Switch to a readable theme:**
Settings → Appearance → Themes → Browse → search "Minimal" or "Things"
Both are clean, typographic, and look nothing like a code editor.

**2. Turn on Reading View or Live Preview:**
Settings → Editor → Default editing mode → "Live Preview"
This hides the markdown syntax while you type. `**bold**` becomes **bold** as you write it.

After those two changes, it reads like Notion. The underlying files are still plain markdown — that's the point — but you don't have to see the syntax.

---

## What actually makes it different from Notion or Apple Notes

**Your files are yours.** Everything lives as `.md` files in a folder on your computer. No cloud lock-in, no subscription to access your own notes, no service going offline. You can open any note in any text editor.

**Links between notes are first-class.** Type `[[anything]]` and it becomes a clickable link to another note. This is the thing that makes it worth using for technical learning specifically — you can link from a concept you understand to one you don't yet, and that link becomes a to-do.

**It works with your file system.** Your vault is just a folder. You can put it in iCloud, Dropbox, or a git repo. You can organize notes however you like. You can use Finder to move things around and Obsidian will update links automatically.

---

## The graph view

You mentioned not caring about it. Correct take. It's visually satisfying and mostly decorative until you have hundreds of interconnected notes. Ignore it entirely until you find yourself wanting it.

---

## Minimal setup that actually works

**Step 1: Create a vault**
Open Obsidian → Create new vault → name it `notes` or `learning` → put it somewhere you'll remember (iCloud Drive, Desktop, or next to your dev projects).

Don't put it inside a project folder. Keep it separate so it spans projects.

**Step 2: Install Minimal theme**
Settings (gear icon) → Appearance → Themes → Browse → "Minimal" → Install and use.

**Step 3: Turn on Live Preview**
Settings → Editor → Default editing mode → Live Preview.

**Step 4: Make your first note**
Just start writing. Don't organize yet. One note, one concept, whatever you learned today.

That's the whole setup. Everything else is optional.

---

## The one plugin worth installing immediately

**Minimal Theme Settings** (companion to the Minimal theme)
Lets you toggle between different text widths, font sizes, and layout modes without touching CSS. Designers will want this.

After that, ignore the plugin directory for at least a month.

---

## Folder structure for a developer learning vault

```
notes/
  _inbox/          ← dump things here when you're not sure where they go
  javascript/
    async-await.md
    es-modules.md
    event-loop.md
  tools/
    claude-code.md
    obsidian-setup.md   ← this file
  projects/
    flipweather-session-01.md
```

Or just keep everything flat and use tags. Both work. Flat is easier to start with.

---

## Tags vs folders vs links

- **Tags** (`#javascript`, `#learning`) — good for broad categories, searchable
- **Folders** — good for hard separations (work vs personal, for example)
- **Links** (`[[async-await]]`) — good for connecting related ideas, the real power

You don't need all three. Start with tags and links, add folders only if things get cluttered.

---

## The mobile app

Obsidian has a free iOS/Android app. If your vault is in iCloud or Dropbox, it syncs automatically. Obsidian Sync (paid) is their first-party option but not necessary if you're already using iCloud.

The mobile app is good for reading and light editing. Writing long notes works better on desktop.

---

## What this is not good for

- **Polished documents** — use Notion or Google Docs for anything you're sharing with non-technical people
- **Project management** — tasks, deadlines, kanban boards are all possible but clunky
- **Quick capture on mobile** — there's friction compared to Apple Notes; use Notes for raw capture and move things to Obsidian later

---

## The honest pitch

Obsidian is worth it specifically because your notes are plain text files that will be readable in 20 years, you own them completely, and the linking system is genuinely useful for technical learning where concepts connect to each other. Everything else about it — the graph, the plugins, the community — is noise until you've been using it for a few months.

Start small. One note. See if it sticks.

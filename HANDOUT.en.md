# Local Music Transfer · Quick-start Handout

## What it does

It moves NetEase Cloud Music liked songs into Spotify Liked Songs and recreates other playlists as private Spotify playlists with their original names. It migrates references to songs, not audio files.

## First run

1. Install Node.js 18+ and double-click `start.bat`, or run `npm install` and `npm start`.
2. Open `http://127.0.0.1:8787`.
3. Click “Show login QR” and scan it with the NetEase Cloud Music app.
4. Click “Export my playlists” and wait for completion.
5. Check “Exported playlists”; click any row to inspect its tracks.

## Connect Spotify

1. Create a Web API app in the Spotify Developer Dashboard.
2. Add `http://127.0.0.1:8787/callback` as a redirect URI.
3. Enter the Client ID in the local app and click “Authorize Spotify”.
4. Return to the local page after authorization.

Spotify Web API apps require a Premium account. No Client Secret is needed.

## Run the migration

1. Open “Match preview” and set the search delay to 2000 ms.
2. Click “Start match preview” and wait for the counts.
3. Review matched, review, and unmatched tracks.
4. After approval, click “Confirm & write”.
5. Click “Start verification” to check the result.

## Troubleshooting

**Spotify 429**

The search endpoint is rate-limited. Do not retry continuously; wait for the suggested delay or increase the search interval.

Match results are cached one track at a time in `data/match-progress.jsonl`. After an interruption, clicking “Start match preview” again resumes only the tracks that have not been matched.

**QR code expired**

Generate a new QR code and scan it again.

**A NetEase playlist is under review**

The playlist cannot be read right now. It is listed separately; try exporting again after it becomes available.

**A match looks wrong**

Live versions, remixes, instrumentals, regional removals, and same-name tracks are easy to confuse. Review the flagged items before writing.

## Data safety

The `data/` directory contains authorization state and playlist data. Never commit it, upload it, or share screenshots of it. Clearing `data/` requires logging in again.

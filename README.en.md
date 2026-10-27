# Local Music Transfer

A local-only NetEase Cloud Music → Spotify migration tool. The interface runs in your browser and all user data stays on your computer.

中文说明: [README.md](README.md)

## Features

- QR-code login with the NetEase Cloud Music app
- Export liked songs and all user playlists
- Spotify OAuth PKCE authorization without a Client Secret
- Match preview using title, artists, album, duration, and version signals
- Save liked songs to Spotify Liked Songs
- Recreate other playlists as private Spotify playlists with the same names
- Resume safely, de-duplicate tracks, and skip tracks already present
- Verify destination membership after writing
- Chinese / English UI toggle
- A local data directory; playlists and credentials are not uploaded

NetEase Cloud Music and Spotify are the currently enabled services. Apple Music, YouTube Music, Deezer, TIDAL, SoundCloud, Pandora, Last.fm, and Bandcamp are shown as “Coming soon” in the UI.

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

On Windows, you can also double-click `start.bat`.

Open:

```text
http://127.0.0.1:8787
```

Before the first Spotify authorization, create a Web API app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and add this redirect URI:

```text
http://127.0.0.1:8787/callback
```

Spotify currently requires a Premium account for Web API apps. Enter the Client ID in the page; a Client Secret is not needed.

## Workflow

1. Open “NetEase login & export”, generate the QR code, and scan it with the NetEase app.
2. Click “Export my playlists” and wait for the export to finish.
3. Use “Exported playlists” to verify counts and inspect individual tracks. Playlists NetEase reports as under review are listed separately.
4. Enter the Spotify Client ID and click “Authorize Spotify”.
5. Open “Match preview”, set the search delay to at least 3000 ms, and review the matched, review, and unmatched counts. A 2000 ms interval can still hit rate limits.
6. After approval, click “Confirm & write”. Liked songs go to Liked Songs; other playlists are recreated with their original names.
7. Click “Start verification” and check the final destination state.

## Batch migration

You do not need to match all 16k songs at once. Select playlists under “Exported playlists” and the app will match and write only that batch, with a 700-track limit per batch. After finishing a batch, return to the list and select the next one. Cached matches are reused and are not queried again.

For the first test, choose a playlist with 100–300 tracks, run the complete match/write/verify cycle, and then continue with the remaining batches. Playlists already created in Spotify are reused through migration markers.

If some tracks cannot be matched yet, enable “Allow partial write”: matched tracks are written first and unmatched tracks are skipped. Re-select the same playlist later to reuse the existing Spotify playlist and append the missing tracks.

## Data and security

- `data/` stores local authorization state and exported data and is excluded by `.gitignore`.
- The app never sees or stores NetEase or Spotify passwords.
- Spotify uses OAuth PKCE, so no Client Secret is stored.
- Deleting `data/` requires a new NetEase scan and Spotify authorization.
- Never share the `data/` directory, screenshots of it, or its contents publicly.

## Project structure

```text
local-migrate-site/
├─ public/            Browser interface
│  ├─ index.html
│  ├─ style.css
│  └─ app.js
├─ server.mjs         Local Node server and platform APIs
├─ package.json
├─ start.bat          Windows launcher
├─ README.md          Chinese guide
├─ README.en.md       English guide
├─ HANDOUT.md         Chinese quick-start handout
└─ HANDOUT.en.md      English quick-start handout
```

## Known limitations

- Spotify Web API access requires a Premium account.
- Search endpoints use rolling rate limits. When a 429 is returned, wait for `Retry-After` or increase the search delay.
- Match results are cached track by track in `data/match-progress.jsonl`; a restarted run skips songs that are already cached.
- The NetEase community API is not an official long-term stable API and may change.
- Live versions, remixes, instrumentals, regional removals, and same-name tracks may require manual review.
- This tool migrates song references; it does not download or upload audio.
- Playlists unavailable because of NetEase review cannot be migrated and are reported separately.

## Extending the service catalog

The service list and transfer animation are driven by the `SERVICES` object near the top of `public/app.js`. Adding a platform requires its display name, brand color, SVG logo, enabled state, and platform-specific export, authorization, and matching adapters.

## License

For personal music-library migration. Follow the terms of service of each connected platform.


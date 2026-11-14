# HabitFlow — Personal Habit Tracker
**Build consistency. One day at a time.**

Offline-first habit tracker. Plain HTML, CSS and JavaScript, no build step, no backend, no accounts, no tracking.

## What it does
- **Dashboard**: today's learning checklist, completion %, streak, weekly progress, next reminder.
- **Weekly Planner**: the seven-day routine (English, Japanese, Korean, 2D animation, reading, exploring). Browse weeks, complete/undo any past day, add/edit/remove/reorder habits.
- **Learning**: English, Japanese, Korean study timers with session history; 2D animation curriculum with assignments and notes.
- **Knowledge Journal**: six categories plus custom, tags, search, filters.
- **Progress**: daily/weekly/monthly %, month heat-map, per-habit totals and streaks (scheduled days only).
- **Settings**: theme, habits, reminder sound, backup/restore, journal and history export.

## Data and migration
Same IndexedDB (`daymark` / `kv` / `state`) as DAYMARK, so existing data is found. On first launch a copy of the old state is saved (`pre-dayforge-backup`), old notes are copied into the Journal (once), and old tasks/reminders stay in storage untouched. Old DAYMARK JSON backups can be restored in Settings > Backup & restore.

## Run locally
    python3 -m http.server 8000

## Deploy
Website: GitHub Pages serving the repository root (unchanged).
Android: `.github/workflows/android-apk.yml` builds a HabitFlow APK (manual run or push to `main`). Package ID stays `com.mujesh.daymark` so existing installs and saved data remain compatible.

### Keeping Android updates working
Android installs an update only if the APK is signed with the same key as the installed app. Create one keystore, store it as a repo secret, and every build will reuse it:

    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    base64 -w0 debug.keystore   # paste as secret ANDROID_DEBUG_KEYSTORE_BASE64

The previously installed DAYMARK APK was built on a random CI key that was never saved, so the first HabitFlow APK cannot update it in place. **Before uninstalling it, export a backup from the old app** (Settings > Export / import data > copy the JSON), then import it in HabitFlow.

## Limits
- Browser reminders can play the bundled alarm while the app is open. Android reminders use the same WAV file in the HabitFlow notification channel; exact-alarm behaviour varies by Android version.

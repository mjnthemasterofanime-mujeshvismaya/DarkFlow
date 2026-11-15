# DAYFORGE test report
Executed (Playwright/Chromium, local server, 32 checks passed in the first run; the 2 streak checks that failed
were test-date errors, then re-verified with the clock pinned to 2026-11-13):
- Migration of a simulated old DAYMARK database: notes -> journal once, tasks/reminders kept, theme kept, snapshot saved, no duplicates on reload.
- Schedule: habit counts and Saturday/Sunday order match the routine.
- Complete / undo / no auto-completion / future days blocked.
- Streaks use scheduled days only; missed scheduled day breaks; pending today does not.
- All six views render; animation curriculum shows 7 topics; journal create + tag search.
- Old and new backup formats accepted; invalid file rejected.
- No horizontal overflow at 360, 390, 430, 768, 1366, 1920 widths. Offline reload via service worker.
NOT executed: Android build/install/notifications/back button, file download on Android, GitHub Pages deploy, GitHub Actions run.
APK: NOT generated (no Android SDK / Gradle access in this environment).

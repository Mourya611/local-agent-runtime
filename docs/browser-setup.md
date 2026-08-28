# Local Chrome Remote Debugging (CDP) Setup Guide

Connecting the agent runtime to your local Chrome browser allows it to reuse existing authenticated web sessions without requiring password logins.

---

## 1. Launching Chrome with CDP Enabled

Close all existing Chrome windows, then start Chrome from your terminal with `--remote-debugging-port=9222`:

### Windows PowerShell:
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:LOCALAPPDATA\Google\Chrome\User Data"
```

### macOS:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

### Linux:
```bash
google-chrome --remote-debugging-port=9222
```

---

## 2. Verifying Connection

Open [http://127.0.0.1:9222/json/version](http://127.0.0.1:9222/json/version) in your browser. You should see a JSON payload containing `webSocketDebuggerUrl`.

---

## 3. Runtime Integration

When connected, the sidebar status badge in the Next.js UI will illuminate **Chrome CDP Context: Live**.
If port 9222 is not open, the agent automatically falls back to an isolated Playwright Chromium instance.

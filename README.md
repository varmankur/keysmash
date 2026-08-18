# Key Smash (@lab39/keysmash)

A proprietary, fully self-hosted web engine for creating dynamic, brand-customizable feedback forms on your private network or server. Designed for enterprise events, workshops, and closed networks.

## Features

- **No Cloud Required**: 100% self-hosted on your local network or server. Data never leaves your machine.
- **Daimon Admin Dashboard**: A sleek, protected control panel to manage multiple forms, view submissions, and export data.
- **Rich Media Support**: Native browser integration for students to submit photo and video feedback (directly from their mobile phones).
- **Brand Customization**: Tweak form logos, primary colors, and descriptions on the fly.
- **Zero Configuration**: Built-in SQLite database automatically provisions itself. Just run it.

## Quick Start

### 1. Install Globally
Install the package globally via NPM:
```bash
npm install -g @lab39/keysmash
```

### 2. Initialize a Workspace
Create an empty directory where you want your database and media files to live, and run `keysmash`:
```bash
mkdir my-event
cd my-event
keysmash
```

The CLI will automatically copy the required binaries, initialize the SQLite database, and boot the server.

### 3. Access the Dashboard
Navigate to the automatically generated secure URL (e.g. `https://localhost:3000/daimon`).
On your first visit, you will be prompted to create the master **Daimon** administrator account.

From there, you can create forms and share the URLs with your users!

---

## Configuration

By default, Key Smash generates a self-signed SSL certificate so that modern browser APIs like `getUserMedia` (Camera/Microphone) function correctly for users on your local Wi-Fi network.

If you are running Key Smash behind a reverse proxy (like Nginx, Traefik, or Cloudflare) that handles HTTPS for you, you can disable the internal SSL generation:

```bash
DISABLE_HTTPS=true keysmash
```

## Security

This is proprietary software. The source code is compiled and minified to protect intellectual property. User passwords are salted and hashed.

## Exports & Data
All uploaded videos, photos, and SQLite database files (`dev.db`) are stored locally in the folder where you ran the `keysmash` command. You can export form responses to a `.zip` directly from the admin dashboard.

# Generic Feedback Server

A production-grade, highly customizable feedback and event-registration server. Built with Next.js, Prisma, and TailwindCSS. It supports multi-media uploads, anomaly/bug reporting, secure super-admin access, and fully customizable configuration via code.

## Key Features
- **Config-Driven**: Easily change the branding (logos, names) and questions without changing database schema.
- **Multi-Media Support**: Users and admins can attach multiple photos/videos to feedback entries.
- **Top-Secret Daimon Tier**: Dedicated Overwatch dashboard for super-admins to track live anomalies and bug reports.
- **Production HTTPS Ready**: Serves locally over HTTPS to securely handle data across mobile phones and laptops on the same Wi-Fi network.
- **Data Export**: Bundle all your data (Excel + Photos + Videos) into a single zip file with one click.

## Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/varmankur/generic-feedback-app.git
   cd generic-feedback-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment:**
   Copy the example environment file and update the credentials as needed:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Generate Local SSL Certificates:**
   Since the server runs on HTTPS for local network securely, you need to generate self-signed certificates:
   ```bash
   mkdir -p certs
   openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj '/CN=localhost'
   ```

6. **Build and Run (Production HTTPS):**
   ```bash
   npm run build
   npm run start:https
   ```
   *The app will now be available across your network at `https://<YOUR-IP>:3000`. Users will need to click "Advanced -> Proceed" to bypass the self-signed certificate warning.*

## Customizing the Event
To customize the logo, event name, and feedback questions, edit the configuration file located at:
`src/config/feedback.config.ts`

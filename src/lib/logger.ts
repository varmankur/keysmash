import fs from 'fs';
import path from 'path';

export function logEvent(action: string, details: unknown) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'app.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action}: ${JSON.stringify(details)}\n`;
    
    fs.appendFileSync(logFile, logEntry);
    console.log(logEntry.trim());
  } catch {
    console.error('Failed to write log', error);
  }
}

const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../logs/cronJobs.log");

if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

const writeToLogFile = (level, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry, "utf-8");
};

const logger = {
  info: (msg) => {
    console.log(`ℹ️  ${msg}`);
    writeToLogFile("INFO", msg);
  },
  warn: (msg) => {
    console.warn(`⚠️  ${msg}`);
    writeToLogFile("WARN", msg);
  },
  error: (msg) => {
    console.error(`❌ ${msg}`);
    writeToLogFile("ERROR", msg);
  },
};

module.exports = logger;
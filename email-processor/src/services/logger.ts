import fs from "fs";

function logToFile(message: string, fileName: string) {
  const date = new Date().toISOString();
  const logStream = fs.createWriteStream(`logs/${fileName}.txt`, { flags: "a" });
  logStream.write(`${message} - ${date}\n`);
  logStream.end();
}
const logger = {
  info: (message: string, context: string = "Email Processor", fileName: string = "logs") => logToFile(`${context} - [INFO] ${message}`, fileName),
  warn: (message: string, context: string = "Email Processor", fileName: string = "logs") => logToFile(`${context} - [WARN] ${message}`, fileName),
  error: (message: string, context: string = "Email Processor", fileName: string = "logs") => logToFile(`${context} - [ERROR] ${message}`, fileName),
};

export default logger;
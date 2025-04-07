import fs from "fs";
export interface ILogger {
  info: (message: string, context: string, fileName: string) => void;
  warn: (message: string, context: string, fileName: string) => void;
  error: (message: string, context: string, fileName: string) => void;
  createMainContext: (context: string) => void;
}

export class Logger implements ILogger {
  private mainContext: string = "";

  constructor() {}

  private logToFile(message: string, fileName: string) {
    const date = new Date().toISOString();
    const rootPath = this.mainContext ? `logs/${this.mainContext}` : "logs";
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }
    const logStream = fs.createWriteStream(`${rootPath}/${fileName}.txt`, { flags: "a" });
    logStream.write(`${message} - ${date}\n`);
    logStream.end();
  }

  info(message: string, context: string = "Email Processor", fileName: string = "logs") {
    this.logToFile(`${context} - [INFO] ${message}`, fileName);
  }

  warn(message: string, context: string = "Email Processor", fileName: string = "logs") {
    this.logToFile(`${context} - [WARN] ${message}`, fileName);
  }

  error(message: string, context: string = "Email Processor", fileName: string = "logs") {
    this.logToFile(`${context} - [ERROR] ${message}`, fileName);
  }

  createMainContext(context: string) {
    this.mainContext = context;
  }
}
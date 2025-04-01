import fs from "fs";
export interface ILogger {
  info: (message: string, context: string, fileName: string) => void;
  warn: (message: string, context: string, fileName: string) => void;
  error: (message: string, context: string, fileName: string) => void;
  addIdentation: () => void;
  removeIdentation: () => void;
}

export class Logger implements ILogger {
  private identation = "";

  constructor() {}

  private logToFile(message: string, fileName: string) {
    const date = new Date().toISOString();
    const logStream = fs.createWriteStream(`logs/${fileName}.txt`, { flags: "a" });
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

  addIdentation() {
    this.identation += "  ";
  }

  removeIdentation() {
    this.identation = this.identation.slice(0, -2);
  }
}
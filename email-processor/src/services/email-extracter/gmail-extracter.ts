import { EmailDetail, MessagePart } from "../../models/email-detail";
import { IEmailExtracter } from "./i-email-extracter";
import { Logger } from "../logger";

export class GmailExtracter implements IEmailExtracter {
  constructor(private logger: Logger) {}

  private getBodyFromParts(parts: MessagePart[]): string {
    for(var part of parts) {
      if(part.mimeType === "text/html" || part.mimeType === "text/plain") {
        return part.body?.data || "";
      }
      if(part.parts) {
        return this.getBodyFromParts(part.parts);
      }
    }
    return "";
  }

  // Decode the email body
  private getBody(messagePayload: MessagePart): string {
    let encodedBody: string = "";
    this.logger.info(
      `messagePayload.parts: ${messagePayload.parts ? "true" : "false"}`,
      "GmailExtracter/getBody"
    );
    if (messagePayload.parts) {
      encodedBody = this.getBodyFromParts(messagePayload.parts);
    } else {
      encodedBody = messagePayload.body?.data || "";
    }
    this.logger.info(`encodedBody: ${encodedBody}`, "GmailExtracter/getBody");
    const buffer = Buffer.from(encodedBody, "base64");
    return buffer.toString("utf-8");
  }

  getEmailBody(emailDetail: EmailDetail): string | null {
    if (emailDetail.payload) {
      const body = this.getBody(emailDetail.payload);
      return body;
    }
    this.logger.error(
      `emailDetail.payload is null or undefined.`,
      "gmail-extracter-get-email-body"
    );
    return null;
  }
}

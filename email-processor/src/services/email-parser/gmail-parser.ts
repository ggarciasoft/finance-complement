import { IEmailParser } from "./i-email-parser";
import { EmailDetail, MessagePart } from "../../models/email-detail";
import { Transaction } from "../../models/transaction";

export class GmailParser implements IEmailParser {
    // Decode the email body
    private getBody(messagePayload: MessagePart) {
        let encodedBody: string = '';
        if (messagePayload.parts) {
            encodedBody = messagePayload.parts.filter(part => part.mimeType === 'text/html' || part.mimeType === 'text/plain')[0].body?.data || '';
        } else {
            encodedBody = messagePayload.body?.data || '';
        }
        const buffer = Buffer.from(encodedBody, 'base64');
        return buffer.toString('utf-8');
    }

    getTransaction(emailDetail: EmailDetail): Promise<Transaction> {
        return new Promise((resolve, err) => {
            if (emailDetail.payload) {
                const body = this.getBody(emailDetail.payload);
            }
            resolve(new Transaction());
        });
    }
}
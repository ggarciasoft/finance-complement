import { EmailDetail } from "../../models/email-detail";
import { Transaction } from "../../models/transaction";

export interface IEmailParser {
    getTransaction(emailDetail: EmailDetail): Promise<Transaction>;
}
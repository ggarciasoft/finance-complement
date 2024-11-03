import { Banks } from "../../models/config-data";
import { Transaction, TransactionType } from "../../models/transaction";

export interface IEmailParser {
    bank: Banks;
    getTransaction(emailBody: string, transactionType: TransactionType): Promise<Transaction | undefined>;
}
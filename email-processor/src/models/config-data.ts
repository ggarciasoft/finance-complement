import { TransactionType } from "./transaction";

export interface ConfigData {
  fromDate: string;
  emailProcessed: string[];
  emailBankMapping: EmailBankMapping[];
  accountMapping: AccountMapping[];
}

export interface EmailBankMapping {
  emailFrom: string[];
  emailTitle: string;
  bank: Banks;
  emailTransactionType: EmailTransactionType[];
}

export interface AccountMapping {
  accountName: string;
  bankAccountFormats: string[];
}

export interface EmailTransactionType {
  emailTitle: string;
  transactionType: TransactionType;
}

export enum Banks {
  BHD = "BHD",
}

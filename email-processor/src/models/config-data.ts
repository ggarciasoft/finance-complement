import { TransactionType } from "./transaction";

export interface ConfigData {
  fromDate: string;
  defaultCurrency: Currency;
  emailProcessed: string[];
  emailBankMapping: EmailBankMapping[];
  accountMapping: Account[];
  toshlToken: string;
  toshlUrl: string;
  exchangeRate: ExchangeRate[];
}

export interface EmailBankMapping {
  emailFrom: string[];
  emailTitle: string;
  bank: Banks;
  emailTransactionType: EmailTransactionType[];
}

export interface Account {
  toshlAccountId: string;
  currency: Currency;
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

export enum Currency {
  DOP = "DOP",
  USD = "USD",
}

export interface ExchangeRate {
  currency: Currency;
  rate: number;
}


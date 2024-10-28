export interface ConfigData {
    fromDate: string;
    emailProcessed: string[];
    emailBankMapping: EmailBankMapping[];
    accountMapping: AccountMapping[];
}

export interface EmailBankMapping {
    emailFrom: string;
    emailTitle: string;
    bank: string;
}

export interface AccountMapping {
    accountName: string;
    bankAccountFormats: string[];
}
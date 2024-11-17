export interface Currency {
    code: string;
    rate: number;
    fixed: boolean;
}

export interface Transaction {
    account: string;
    currency: Currency;
}

export interface ToshlEntry {
    amount: number;
    currency: Currency;
    date: string;
    desc: string;
    account: string;
    category: string;
    tags: string[];
    transaction?: Transaction;
}
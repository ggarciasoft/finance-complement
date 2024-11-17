import { Account } from "./config-data";

export class Transaction {
    accountFrom: Account | null = null;
    accountTo: Account | null = null;
    category: string = "";
    tags: string[] = [];
    amount: number = 0;
    date: Date = new Date();
    note: string = "";
    transactionType: TransactionType = TransactionType.None;
}

export enum TransactionType {
    None,
    TransferBetweenAccount,
    Deposit,
    Withdrawal,
    PayWithAccount,
    PayWithCard
}
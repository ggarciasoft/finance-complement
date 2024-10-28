export class Transaction {
    accountFrom: string | null = null;
    accountTo: string | null = null;
    category: string = "";
    tags: string[] = [];
    amount: number = 0;
    date: Date = new Date();
    note: string = "";
    transactionType: TransactionType = TransactionType.Transfer;
}

export enum TransactionType {
    Transfer,
    Deposit,
    Withdrawal,
    Pay
}
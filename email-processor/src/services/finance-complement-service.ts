import { Account, ConfigData } from "../models/config-data";
import { ToshlEntry } from "../models/toshl-entry";
import { Transaction, TransactionType } from "../models/transaction";
import logger from "../services/logger";
export interface IFinanceComplementService {
    saveTransaction(transaction: Transaction): Promise<void>;
}

export class FinanceComplementService implements IFinanceComplementService {
    constructor(private configData: ConfigData) {
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        const account = transaction.accountFrom ?? transaction.accountTo!;
        const currencyCode = account?.currency ?? this.configData.defaultCurrency;
        let toshlEntry: ToshlEntry = {
            amount: transaction.amount,
            account: account.toshlAccountId,
            currency: {
                code: currencyCode,
                rate: this.getExchangeRate(account),
                fixed: false
            },
            date: transaction.date.toISOString().split('T')[0],
            desc: transaction.note,
            category: transaction.category,
            tags: transaction.tags
        };

        switch (transaction.transactionType) {
            case TransactionType.TransferBetweenAccount:
                toshlEntry.transaction = transaction.accountFrom ? {
                    account: transaction.accountFrom.toshlAccountId,
                    currency: {
                        code: transaction.accountFrom.currency,
                        rate: this.getExchangeRate(transaction.accountFrom),
                        fixed: false
                    }
                } : undefined;
                break;
        }

        const response = await fetch(this.configData.toshlUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.configData.toshlToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toshlEntry)
        });

        if (!response.ok) {
            logger.error(`Failed to create Toshl entry: ${response.status} ${response.statusText}`, "finance-complement-service-save-transaction");
        }
    }

    private getExchangeRate(account: Account): number {
        return this.configData.exchangeRate.find(e => e.currency === account.currency)?.rate ?? 1;
    }
}

    

import { Account, ConfigData } from "../models/config-data";
import { ToshlEntry } from "../models/toshl-entry";
import { Transaction, TransactionType } from "../models/transaction";
import { Logger } from "./logger";

export interface IFinanceComplementService {
    saveTransaction(transaction: Transaction): Promise<void>;
}

export class FinanceComplementService implements IFinanceComplementService {
    constructor(private configData: ConfigData, private logger: Logger) {
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        this.logger.addIdentation();
        this.logger.info(`Saving transaction: ${JSON.stringify(transaction)}`, "FinanceComplementService/saveTransaction");
        const account = transaction.accountFrom ?? transaction.accountTo!;

        if(!transaction.amount || !account) {
            this.logger.error(`Transaction amount or account is null`, "FinanceComplementService/saveTransaction");
            this.logger.removeIdentation();
            return;
        }
        
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
            category: "57509326",// Category is other for now, should be transaction.category,
            tags: ["82156693", ...transaction.tags] //Tag is API Entry.
        };

        switch (transaction.transactionType) {
            case TransactionType.TransferBetweenAccount:
                toshlEntry.transaction = transaction.accountFrom ? {
                    account: transaction.accountTo!.toshlAccountId,
                    currency: {
                        code: transaction.accountTo!.currency,
                        rate: this.getExchangeRate(transaction.accountTo!),
                        fixed: false
                    }
                } : undefined;
                break;
        }

        this.logger.info(`Sending Toshl entry: ${JSON.stringify(toshlEntry)}`, "FinanceComplementService/saveTransaction");
        
        const response = await fetch(this.configData.toshlUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.configData.toshlToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toshlEntry)
        });

        if (!response.ok) {
            this.logger.error(`Failed to create Toshl entry: ${response.status} ${response.statusText}`, "FinanceComplementService/saveTransaction");
        }

        this.logger.info(`Toshl entry created: ${response.status}`, "FinanceComplementService/saveTransaction");

        this.logger.removeIdentation();
    }

    private getExchangeRate(account: Account): number {
        return this.configData.exchangeRate.find(e => e.currency === account.currency)?.rate ?? 1;
    }
}

    

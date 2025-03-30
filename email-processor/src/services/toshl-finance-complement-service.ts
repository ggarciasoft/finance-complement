import { Account, ConfigData } from "../models/config-data";
import { ToshlEntry } from "../models/toshl-entry";
import { Transaction, TransactionType } from "../models/transaction";
import logger from "./logger";
export interface IFinanceComplementService {
    saveTransaction(transaction: Transaction): Promise<void>;
}

export class FinanceComplementService implements IFinanceComplementService {
    constructor(private configData: ConfigData) {
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        logger.addIdentation();
        logger.info(`Saving transaction: ${JSON.stringify(transaction)}`, "FinanceComplementService/saveTransaction");
        const account = transaction.accountFrom ?? transaction.accountTo!;

        if(!transaction.amount || !account) {
            logger.error(`Transaction amount or account is null`, "FinanceComplementService/saveTransaction");
            logger.removeIdentation();
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
            category: transaction.category,
            tags: transaction.tags
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

        logger.info(`Sending Toshl entry: ${JSON.stringify(toshlEntry)}`, "FinanceComplementService/saveTransaction");
        
        const response = await fetch(this.configData.toshlUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.configData.toshlToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toshlEntry)
        });

        if (!response.ok) {
            logger.error(`Failed to create Toshl entry: ${response.status} ${response.statusText}`, "FinanceComplementService/saveTransaction");
        }

        logger.info(`Toshl entry created: ${response.status}`, "FinanceComplementService/saveTransaction");

        logger.removeIdentation();
    }

    private getExchangeRate(account: Account): number {
        return this.configData.exchangeRate.find(e => e.currency === account.currency)?.rate ?? 1;
    }
}

    

import { IEmailParser } from "./i-email-parser";
import { Transaction, TransactionType } from "../../models/transaction";
import { Account, Banks, ConfigData } from "../../models/config-data";
import { JSDOM } from "jsdom";
import { Logger } from '../logger';

export class BHDParser implements IEmailParser {
  bank: Banks = Banks.BHD;

  constructor(private configData: ConfigData, private readonly logger: Logger) {}

  getTransaction(
    emailBody: string,
    transactionType: TransactionType
  ): Promise<Transaction | undefined> {
    return new Promise((resolve) => {
      let transaction: Transaction | undefined;
      try {
        switch (transactionType.toString()) {
          case "PayWithCard":
            transaction = this.parsePayWithCard(emailBody);
            transaction!.amount = -transaction!.amount;
            break;
          case "TransferBetweenAccount":
            transaction = this.parseTransferBetweenAccounts(emailBody);
            break;
          case "PayWithAccount":
            transaction = this.parseTransferBetweenAccounts(emailBody);
            transaction!.amount = -transaction!.amount;
            break;
          case "Deposit":
            transaction = this.parseDeposit(emailBody);
            break;
          default:
            this.logger.error(
              `Transaction type not supported: ${transactionType}.`,
              "BHDParser/getTransaction"
            );
            resolve(undefined);
            break;
        }

        if (transaction) {
          transaction.transactionType = transactionType;
          transaction.note += ` - ${transactionType} - Email Processor.`;
        }
        this.logger.info(
          `Transaction: ${JSON.stringify(transaction)}`,
          "BHDParser/getTransaction",
          "bhd-parser-transactions"
        );
        resolve(transaction);
      } catch (error) {
        this.logger.error(`Error parsing BHD email: ${error}`);
        resolve(undefined);
      }
    });
  }

  parsePayWithCard(emailHtml: string): Transaction | undefined {
    const dom = new JSDOM(emailHtml);
    const doc = dom.window.document;

    // Create new transaction
    const transaction = new Transaction();

    // Get card number from the notification text
    const notificationText =
      doc.querySelector("p[class$='justify']")?.textContent || "";
    const cardMatch = notificationText.match(/Visa Premia # (\d+)/);
    const accountFrom = cardMatch ? cardMatch[1] : null;

    transaction.accountFrom = this.getAccount(accountFrom);

    // Get transaction details from the table
    const tableRow = doc.querySelector("table[class$='table_trans'] tbody tr");
    if (tableRow) {
      const cells = tableRow.getElementsByTagName("td");

      if (cells[4].textContent?.trim() === "Declinada") {
        return;
      }
      // Parse date (cells[0])
      const dateStr = cells[0].textContent?.trim() || "";
      const [datePart] = dateStr.split(" ");
      const [day, month, year] = datePart.split("/");

      transaction.date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      // Parse amount (cells[2])
      const amountStr =
        cells[2].textContent?.trim().replace("$", "").replace(",", "") || "0";
      transaction.amount = parseFloat(amountStr);

      // Get category/commerce (cells[3])
      transaction.category = cells[3].textContent?.trim() || "";
      transaction.note =
        transaction.category + " - " + dateStr + " - " + accountFrom;

      // Set transaction type based on "Tipo" column (cells[5])
      /*
      const tipo = cells[5].textContent?.trim().toLowerCase() || "";
  
      transaction.transactionType =
        tipo === "compra" ? TransactionType.PayWithCard : TransactionType.None;
        */
    }

    return transaction;
  }

  getAccount(accountFormat: string | null): Account | null {
    if(accountFormat){
      for(const account of this.configData.accountMapping){
        for(const bankAccountFormat of account.bankAccountFormats){
          if(bankAccountFormat.includes(accountFormat)){
            return account;
          }
        }
      }
    }
    
    return null;
  }

  parseTransferBetweenAccounts(emailHtml: string): Transaction | undefined {
    const dom = new JSDOM(emailHtml);
    const doc = dom.window.document;

    // Create new transaction
    const transaction = new Transaction();

    const accountFrom =
      doc.querySelector("td[id$='idProductoOrigen'] p strong")?.textContent ||
      null;
    transaction.accountFrom = this.getAccount(accountFrom);

    const accountTo =
      doc.querySelector("td[id$='idProductoDestino'] p strong")?.textContent ||
      null;
    transaction.accountTo = this.getAccount(accountTo);

    // Get amount
    const amountStr =
      doc.querySelector("td[id$='idMonto'] p strong")?.textContent || "";
    transaction.amount = parseFloat(
      amountStr.replace("RD$", "").replace(",", "").trim()
    );

    // Get date and description
    const dateStr =
      doc.querySelector("td[id$='idFechayHoraTransaccion'] p strong")
        ?.textContent || "";
    const description =
      doc.querySelector("td[id$='idDescripcion'] p strong")?.textContent || "";

    // Parse date
    if (dateStr) {
      const [datePart] = dateStr.split(" - ");
      const [day, month, year] = datePart.split("/");

      transaction.date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
    }

    // Set note combining description and date
    transaction.note =
      `${description} - ${dateStr} - ${accountFrom} - ${accountTo}`.trim();

    return transaction;
  }

  parseDeposit(emailHtml: string): Transaction | undefined {
    const dom = new JSDOM(emailHtml);
    const doc = dom.window.document;

    // Create new transaction
    const transaction = new Transaction();

    // Get account numbers
    let accountTo =
      doc.querySelector("td[id$='idProductoOrigen'] p")?.textContent || "";
    accountTo = accountTo?.substring(accountTo.length - 4);
    this.logger.info(`accountTo: ${accountTo}`, "BHDParser/parseDeposit");
    transaction.accountTo = this.getAccount(accountTo);
    this.logger.info(`transaction.accountTo: ${transaction.accountTo}`, "BHDParser/parseDeposit");

    // Get amount
    var tags = doc.querySelectorAll("td[id$='idDescripcion']");

    const amountStr = tags?.length ? tags[tags.length - 1].textContent : "";

    if(!amountStr){
      this.logger.error("Amount not found", "BHDParser/parseDeposit");
      return;
    }

    transaction.amount = parseFloat(
      amountStr.replace("RD$", "").replace(",", "").trim()
    );

    // Get date and description
    const dateStr =
      doc.querySelector("td[id$='idNumeroConfirmacion'] p span")?.textContent ||
      "";
    const bankFrom =
      doc.querySelector("td[id$='idNumeroConfirmacion'] p")?.textContent || "";
    const nameFrom =
      doc.querySelector("td[id$='idDescripcion'] p")?.textContent || "";

    // Parse date
    if (dateStr) {
      const [day, month, year] = dateStr.split("/");

      transaction.date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
    }

    // Set note combining description and date
    transaction.note =
      `${nameFrom} - ${bankFrom} - ${dateStr} - ${accountTo}`.trim();

    return transaction;
  }
}

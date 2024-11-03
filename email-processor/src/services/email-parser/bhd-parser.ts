import { IEmailParser } from "./i-email-parser";
import { Transaction, TransactionType } from "../../models/transaction";
import { Banks } from "../../models/config-data";
import { JSDOM } from "jsdom";

export class BHDParser implements IEmailParser {
  bank: Banks = Banks.BHD;

  getTransaction(
    emailBody: string,
    transactionType: TransactionType
  ): Promise<Transaction | undefined> {
    return new Promise((resolve) => {
      let transaction: Transaction | undefined;
      switch (transactionType) {
        case TransactionType.PayWithCard:
          transaction = parsePayWithCard(emailBody);
          break;
        case TransactionType.TransferBetweenAccount:
        case TransactionType.PayWithAccount:
          transaction = parseTransferBetweenAccounts(emailBody);
          break;
        case TransactionType.Deposit:
          transaction = parseDeposit(emailBody);
          break;
        default:
          console.error(`Transaction type not supported: ${transactionType}.`);
          resolve(undefined);
          break;
      }

      if (transaction) {
        transaction.transactionType = transactionType;
        transaction.note += ` - ${transactionType} - Email Processor.`;
      }
      resolve(transaction);
    });
  }
}

function parsePayWithCard(emailHtml: string): Transaction | undefined {
  const dom = new JSDOM(emailHtml);
  const doc = dom.window.document;

  // Create new transaction
  const transaction = new Transaction();

  // Get card number from the notification text
  const notificationText =
    doc.querySelector("p[class$='justify']")?.textContent || "";
  const cardMatch = notificationText.match(/Visa Premia # (\d+)/);
  transaction.accountFrom = cardMatch ? cardMatch[1] : null;

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
    transaction.date = new Date(parseInt(year), parseInt(month), parseInt(day));

    // Parse amount (cells[2])
    const amountStr =
      cells[2].textContent?.trim().replace("$", "").replace(",", "") || "0";
    transaction.amount = parseFloat(amountStr);

    // Get category/commerce (cells[3])
    transaction.note = (cells[3].textContent?.trim() || "") + " - " + dateStr;
    transaction.category = cells[3].textContent?.trim() || "";

    // Set transaction type based on "Tipo" column (cells[5])
    /*
    const tipo = cells[5].textContent?.trim().toLowerCase() || "";

    transaction.transactionType =
      tipo === "compra" ? TransactionType.PayWithCard : TransactionType.None;
      */
  }

  return transaction;
}

function parseTransferBetweenAccounts(
  emailHtml: string
): Transaction | undefined {
  const dom = new JSDOM(emailHtml);
  const doc = dom.window.document;

  // Create new transaction
  const transaction = new Transaction();

  // Get account numbers
  transaction.accountFrom =
    doc.querySelector("td[id$='idProductoOrigen'] p strong")?.textContent ||
    null;
  transaction.accountTo =
    doc.querySelector("td[id$='idProductoDestino'] p strong")?.textContent ||
    null;

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
  transaction.note = `${description} - ${dateStr}`.trim();

  return transaction;
}

function parseDeposit(emailHtml: string): Transaction | undefined {
  const dom = new JSDOM(emailHtml);
  const doc = dom.window.document;

  // Create new transaction
  const transaction = new Transaction();

  // Get account numbers
  transaction.accountTo =
    doc.querySelector("td[id$='idProductoOrigen'] p")?.textContent || null;

  // Get amount
  const amountStr =
    doc.querySelector("td[id$='idDescription']")?.textContent || "";
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
  transaction.note = `${nameFrom} - ${bankFrom} - ${dateStr}`.trim();

  return transaction;
}

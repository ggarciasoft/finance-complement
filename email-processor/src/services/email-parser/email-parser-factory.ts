import { Banks, ConfigData } from "../../models/config-data";
import { EmailDetail } from "../../models/email-detail";
import { TransactionType } from "../../models/transaction";
import { Logger } from "../logger";
import { BHDParser } from "./bhd-parser";
import { IEmailParser } from "./i-email-parser";

export interface IEmailParserFactory {
  getEmailParser(
    emailDetail: EmailDetail
  ): { parser: IEmailParser | undefined; transactionType: TransactionType | undefined } | undefined;
}

export class EmailParserFactory implements IEmailParserFactory {
  constructor(private configData: ConfigData, private bhdParser: BHDParser, private logger: Logger) {}

  getEmailParser(
    emailDetail: EmailDetail
  ): { parser: IEmailParser | undefined; transactionType: TransactionType | undefined } | undefined {
    const emailBank = this.configData.emailBankMapping.find(
      (o) =>
        o.emailFrom.includes(emailDetail.from!) &&
        o.emailTransactionType.find((t) => t.emailTitle === emailDetail.title)
    );

    if (!emailBank) {
      this.logger.error(
        `EmailBankMapping not found for Email From: ${emailDetail.from} and Title: ${emailDetail.title}.`,
        "EmailParserFactory/getEmailParser"
      );
      return;
    }

    this.logger.info(
      `EmailBankMapping found for Email From: ${emailDetail.from} and Title: ${emailDetail.title}.`,
      "EmailParserFactory/getEmailParser"
    );

    let parser: IEmailParser | undefined;
    let transactionType: TransactionType | undefined;
    switch (emailBank.bank) {
      case Banks.BHD:
        parser = this.bhdParser;
        break;
      default:
        this.logger.error(`Email Parser not found for bank: ${emailBank!.bank}.`, "EmailParserFactory/getEmailParser");
    }

    this.logger.info(
      `Email Parser found for bank: ${emailBank!.bank}.`,
      "EmailParserFactory/getEmailParser"
    );
    
    // Get the transaction type from the email title.
    transactionType =
    emailBank.emailTransactionType.find(
      (t) => t.emailTitle === emailDetail.title
      )?.transactionType || TransactionType.Deposit;

    return { parser, transactionType }; 
  }
}

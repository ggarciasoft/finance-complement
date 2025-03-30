import { Banks, ConfigData } from "../../models/config-data";
import { EmailDetail } from "../../models/email-detail";
import { TransactionType } from "../../models/transaction";
import { BHDParser } from "./bhd-parser";
import { IEmailParser } from "./i-email-parser";
import logger from "../logger";

export interface IEmailParserFactory {
  getEmailParser(
    emailDetail: EmailDetail
  ): { parser: IEmailParser | undefined; transactionType: TransactionType | undefined } | undefined;
}

export class EmailParserFactory implements IEmailParserFactory {
  constructor(private configData: ConfigData, private bhdParser: BHDParser) {}

  getEmailParser(
    emailDetail: EmailDetail
  ): { parser: IEmailParser | undefined; transactionType: TransactionType | undefined } | undefined {
    logger.addIdentation();
    const emailBank = this.configData.emailBankMapping.find(
      (o) =>
        o.emailFrom.includes(emailDetail.from!) &&
        o.emailTransactionType.find((t) => t.emailTitle === emailDetail.title)
    );

    if (!emailBank) {
      logger.error(
        `EmailBankMapping not found for Email From: ${emailDetail.from} and Title: ${emailDetail.title}.`,
        "EmailParserFactory/getEmailParser"
      );
      logger.removeIdentation();
      return;
    }

    logger.info(
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
        logger.error(`Email Parser not found for bank: ${emailBank!.bank}.`, "EmailParserFactory/getEmailParser");
    }

    logger.info(
      `Email Parser found for bank: ${emailBank!.bank}.`,
      "EmailParserFactory/getEmailParser"
    );
    
    // Get the transaction type from the email title.
    transactionType =
    emailBank.emailTransactionType.find(
      (t) => t.emailTitle === emailDetail.title
      )?.transactionType || TransactionType.Deposit;

    logger.removeIdentation();
    return { parser, transactionType }; 
  }
}

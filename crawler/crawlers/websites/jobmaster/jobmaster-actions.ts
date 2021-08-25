import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { selectors } from "./jobmaster-selectors";
import * as utils from "../../utils";
import Logger from "../../../logger/logger";
import {
  checkIfSentOverThreeTimes,
  collectJobData,
  getAllJobArticles,
  handleApplicationModal,
  openApplicationModal,
} from "./jobmaster-utils";

dotenv.config();
const userPassword = process.env.JOBMASTER_PASSWORD || "";
const userEmail = process.env.JOBMASTER_EMAIL || "";

export const loginToJobmaster = async (page: puppeteer.Page) => {
  await utils.fillInputField(selectors.emailSelector, userEmail, page);
  await utils.fillInputField(selectors.passwordSelector, userPassword, page);
  await page.keyboard.press("Enter");
  await utils.sleep(3000);
};

export const sendApplications = async (page: puppeteer.Page) => {
  const articleElements = await getAllJobArticles(page);
  for (let i = 0; i < articleElements.length; i++) {
    try {
      const { id } = articleElements[i];
      if (id == null) continue;
      await openApplicationModal(page, id);
      const isBlocked = await checkIfSentOverThreeTimes(page);
      await utils.sleep(300);
      if (isBlocked) continue;
      await handleApplicationModal(page);
      const jobData = await collectJobData(page);
      await utils.writeToCSV(jobData);
      await utils.writeToJson(jobData[0]);
    } catch ({ message }) {
      Logger.error(
        `In sendApplications() at jobmaster-actions.ts, line ~37: ${message}`
      );
      continue;
    }
  }
};

export const checkIfJobsAreAvailable = async (page: puppeteer.Page) => {
  return await page.$(selectors.joblistSelector);
};

import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { selectors } from "./jobmaster-selectors";
import * as utils from "../../utils";
import Logger from "../../../logger/logger";
dotenv.config();

const userPassword = process.env.JOBMASTER_PASSWORD || "";
const userEmail = process.env.JOBMASTER_EMAIL || "";

const clickSendApplicationButton = async (page: puppeteer.Page, id: string) => {
  const buttonId = `#applyJob${id.split("misra")[1]}`;
  await utils.clickElement(buttonId, page);
  await utils.sleep(1500);
};

const checkIfSentOverThreeTimes = async (page: puppeteer.Page) => {
  const { jobMasterModalCloseBtnSelector } = selectors;
  try {
    const isBlock = await utils.getTextContent("#modal_content", page);
    if (isBlock.includes("Send More Than 3 Times")) {
      await utils.clickElement(jobMasterModalCloseBtnSelector, page);
      return true;
    } else return false;
  } catch ({ message }) {
    Logger.error(
      `In checkIfSentOverThreeTimes() at jobmaster-actions at ~line 17: ${message}`
    );
  }
};

export const loginToJobmaster = async (page: puppeteer.Page) => {
  await utils.fillInputField(selectors.emailSelector, userEmail, page);
  await utils.fillInputField(selectors.passwordSelector, userPassword, page);
  await page.keyboard.press("Enter");
  await utils.sleep(3000);
};

const getAllJobArticles = async (page: puppeteer.Page) => {
  await page.waitForSelector(selectors.joblistSelector);
  const articleElements = await page.$$eval("article", (as: any[]) =>
    as.map((a: any) => {
      return {
        handle: a,
        id: a.getAttribute("id"),
        value: a.getAttribute("value"),
      };
    })
  );
  return articleElements;
};
export const sendApplications = async (page: puppeteer.Page) => {
  const articleElements = await getAllJobArticles(page);
  try {
    for (let i = 0; i < articleElements.length; i++) {
      const { id } = articleElements[i];
      await page.hover(`#${id}`);
      await utils.clickElement(`#${id}`, page);
      await clickSendApplicationButton(page, id);
      await utils.sleep(400);
      const isBlocked = await checkIfSentOverThreeTimes(page);
      await utils.sleep(300);
      if (isBlocked) continue;
      await addApplicationLetter(page);
      await utils.clickElement(selectors.sendApplicationButton, page);
      await utils.writeToCSV(await collectJobData(page));
    }
    return "OK";
  } catch ({ message }) {
    Logger.error(
      `In sendApplications() at jobmaster-actions.ts, line ~37: ${message}`
    );
  }
};

export const addApplicationLetter = async (page: puppeteer.Page) => {
  const { applicationLetterSelector } = selectors;
  await page.hover("div[class=editOptions]");
  await utils.clickElement("div[class=editOptions]", page);
  await utils.sleep(2000);
  await utils.fillInputField(
    applicationLetterSelector,
    "This resume was sent automatically by a bot created by Koren Ben-Ezri, the resume's owner.",
    page
  );
};

const collectJobData = async (page: puppeteer.Page) => {
  const { getTextContent } = utils;
  const jobData = {
    Title: await getTextContent(selectors.jobTitleSelector, page),
    Location: await getTextContent(selectors.jobLocationSelector, page),
    Type: await getTextContent(selectors.jobTypeSelector, page),
    Salary: await getTextContent(selectors.jobSalarySelector, page),
    Description: await getTextContent(selectors.jobDescriptionSelector, page),
    Requirements: await getTextContent(selectors.jobRequirementsSelector, page),
    Date: new Date().toLocaleDateString,
  };
  return [jobData];
};

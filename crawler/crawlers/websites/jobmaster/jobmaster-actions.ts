import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
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

const checkIfExtraQuestionsArePresent = async (page: puppeteer.Page) => {
  const { extraFormQuestions } = selectors;
  if ((await page.$(extraFormQuestions)) !== null) return true;
  return false;
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
const openApplicationModal = async (page: puppeteer.Page, id: string) => {
  await page.hover(`#${id}`);
  await utils.clickElement(`#${id}`, page);
  await clickSendApplicationButton(page, id);
  await utils.sleep(400);
};
const handleApplicationModal = async (page: puppeteer.Page) => {
  const extraQuestions = await checkIfExtraQuestionsArePresent(page);
  if (extraQuestions) {
    Logger.http(
      `Custom questions detected for page ${page.url()} ... Sending custom questions as email.`
    );
    await sendCustomQuestionsToMail(page);
    await utils.clickElement(selectors.jobMasterModalCloseBtnSelector, page);
    return;
  }
  await addApplicationLetter(page);
  await utils.clickElement(selectors.sendApplicationButton, page);
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
      await utils.writeToCSV(await collectJobData(page));
    } catch ({ message }) {
      Logger.error(
        `In sendApplications() at jobmaster-actions.ts, line ~37: ${message}`
      );
      continue;
    }
  }
};

export const addApplicationLetter = async (page: puppeteer.Page) => {
  const { applicationLetterSelector } = selectors;
  await page.hover("div[class=editOptions]");
  await utils.clickElement("div[class=editOptions]", page);
  await utils.sleep(2000);
  await utils.fillInputField(
    applicationLetterSelector,
    `I am very excited to apply for this position and I sincerely hope you take the time to view my resume and some of the projects I've worked on. 
    Best regards,
    Koren Ben-Ezri, Fullstack Developer.
    `,
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

const sendCustomQuestionsToMail = async (page: puppeteer.Page) => {
  const cid = uuidv4();
  const screenShotTaken = await utils.takeScreenshot(
    `crawlers/websites/jobmaster/images/${cid}.png`,
    page
  );
  if (screenShotTaken !== "OK") {
    Logger.error(screenShotTaken);
    return;
  }
  const mailOptions = {
    from: "Koren Ben-Ezri, FS developer <korenatdevelopes@gmail.com>",
    to: "korenatdevelopes@gmail.com",
    subject: "Get-A-Job: Custom Questions encountered.",
    text: "",
    html: `<p> Hi, I found these custom questions while applying to jobs for you. Link to relevant page: ${page.url()} </p> \n\n
     <img src="cid:${cid}"/>`,
    attachments: [
      {
        filename: "image.png",
        path: `crawlers/websites/jobmaster/images/${cid}.png`,
        cid,
      },
    ],
  };
  await utils.sendMail(mailOptions);
};

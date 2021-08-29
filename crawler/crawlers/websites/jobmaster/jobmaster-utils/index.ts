import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import {
  sleep,
  clickElement,
  getTextContent,
  fillInputField,
  takeScreenshot,
  sendMail,
  withTryCatch,
  getTextContentForJson,
} from "../../../scrape-utils";
import { selectors } from "../jobmaster-selectors";
import Logger from "../../../../logger/logger";

const addApplicationLetter = async (page: puppeteer.Page) => {
  const { applicationLetterSelector } = selectors;
  await page.hover("div[class=editOptions]");
  await clickElement("div[class=editOptions]", page);
  await sleep(2000);
  await fillInputField(
    applicationLetterSelector,
    `I am very excited to apply for this position and I sincerely hope you take the time to view my resume and some of the projects I've worked on. 
      Best regards,
      Koren Ben-Ezri, Fullstack Developer.
      `,
    page
  );
};

export const clickSendApplicationButton = async (
  page: puppeteer.Page,
  id: string
) => {
  const buttonId = `#applyJob${id.split("misra")[1]}`;
  await clickElement(buttonId, page);
  await sleep(1500);
};

export const checkIfSentOverThreeTimes = async (page: puppeteer.Page) => {
  const { jobMasterModalCloseBtnSelector } = selectors;
  try {
    const isBlock = await getTextContent("#modal_content", page);
    if (isBlock.includes("Send More Than 3 Times")) {
      await clickElement(jobMasterModalCloseBtnSelector, page);
      return true;
    } else return false;
  } catch ({ message }) {
    Logger.error(
      `In checkIfSentOverThreeTimes() at jobmaster-actions at ~line 17: ${message}`
    );
  }
};

export const checkIfExtraQuestionsArePresent = async (page: puppeteer.Page) => {
  const { extraFormQuestions } = selectors;
  if ((await page.$(extraFormQuestions)) !== null) return true;
  return false;
};
export const getAllJobArticles = async (page: puppeteer.Page) => {
  await page.waitForSelector(selectors.joblistSelector);
  const articleElements = await page.$$eval("article", (elements: Element[]) =>
    elements.map((a: Element) => {
      return {
        handle: a,
        id: a.getAttribute("id"),
        value: a.getAttribute("value"),
      };
    })
  );
  return articleElements;
};
export const openApplicationModal = async (
  page: puppeteer.Page,
  id: string
) => {
  await page.hover(`#${id}`);
  await clickElement(`#${id}`, page);
  await clickSendApplicationButton(page, id);
  await sleep(400);
};
export const handleApplicationModal = async (page: puppeteer.Page) => {
  const { jobMasterModalCloseBtnSelector } = selectors;
  const extraQuestions = await checkIfExtraQuestionsArePresent(page);
  if (extraQuestions) {
    Logger.http(
      `Custom questions detected for page ${page.url()} ... Sending custom questions as email.`
    );
    await sendCustomQuestionsToMail(page);
    await clickElement(selectors.jobMasterModalCloseBtnSelector, page);
    return;
  }
  await withTryCatch(
    addApplicationLetter,
    [page],
    false,
    undefined,
    async () => {
      await clickElement(jobMasterModalCloseBtnSelector, page);
    }
  );
  await clickElement(selectors.sendApplicationButton, page);
};
export const collectJobData = async (page: puppeteer.Page) => {
  // const jobData = {
  //   Title:
  //     (await getTextContentForJson(selectors.jobTitleSelector, page)) || "N/A",
  //   Location:
  //     (await getTextContentForJson(selectors.jobLocationSelector, page)) ||
  //     "N/A",
  //   Type:
  //     (await getTextContentForJson(selectors.jobTypeSelector, page)) || "N/A",
  //   Salary:
  //     (await getTextContentForJson(selectors.jobSalarySelector, page)) || "N/A",
  //   Description:
  //     (await getTextContentForJson(selectors.jobDescriptionSelector, page)) ||
  //     "N/A",
  //   Requirements:
  //     (await getTextContentForJson(selectors.jobRequirementsSelector, page)) ||
  //     "N/A",
  //   "Date sent": `${new Date()}`,
  // };
  // return [jobData];
  const jobData =
    (await getTextContentForJson(selectors.jobTitleSelector, page)) +
    (await getTextContentForJson(selectors.jobLocationSelector, page)) +
    (await getTextContentForJson(selectors.jobTypeSelector, page)) +
    (await getTextContentForJson(selectors.jobSalarySelector, page)) +
    (await getTextContentForJson(selectors.jobDescriptionSelector, page)) +
    (await getTextContentForJson(selectors.jobRequirementsSelector, page)) +
    `${new Date()}`;
  return [jobData];
};

export const sendCustomQuestionsToMail = async (page: puppeteer.Page) => {
  const cid = uuidv4();
  const screenShotTaken = await takeScreenshot(
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
  await sendMail(mailOptions);
};

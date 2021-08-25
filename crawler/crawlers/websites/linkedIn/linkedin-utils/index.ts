import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import Logger from "../../../../logger/logger";
import { startBrowser } from "../../../start-browser";
import { selectors } from "../linkedIn-selectors";
import {
  clickElement,
  withTryCatch,
  clickElementByText,
  sleep,
  fillInputField,
  checkIfElementExistsByText,
  takeScreenshot,
  sendMail,
} from "../../../utils";

export const linkedInConnectionsLoginLink =
  "https://www.linkedin.com/uas/login?session_redirect=https%3A%2F%2Fwww%2Elinkedin%2Ecom%2Fsearch%2Fresults%2Fpeople%2F%3Fsid%3DPKb&fromSignIn=true&trk=cold_join_sign_in";

export const linkedInJobsLoginLink =
  "https://www.linkedin.com/login?fromSignIn=true&session_redirect=https%3A%2F%2Fwww.linkedin.com%2Fjobs&trk=guest_homepage-jobseeker_nav-header-signin";

export const initStealthLinkedInCraweler = async (address: string) => {
  const userAgent = new UserAgent();
  const browser = await startBrowser();
  if (!browser) return;
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setJavaScriptEnabled(true);
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 100),
    height: 3000 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  });
  await page.evaluateOnNewDocument(() => {
    // Pass webdriver check
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await page.evaluateOnNewDocument(() => {
    //Pass notifications check
    const originalQuery = window.navigator.permissions.query;
    return (window.navigator.permissions.query = (parameters) =>
      // @ts-ignore
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "plugins", {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `languages` property to use a custom getter.
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  page.setDefaultTimeout(10000);
  if (!page) {
    Logger.error("Error occured, aborting..");
  }
  Logger.info(`Navigating to LinkedIn link, url: ${address};`);
  await page.goto(address, {
    waitUntil: "networkidle2",
  });
  return { page, browser };
};
export const initLinkedInCrawler = async (address: string) => {
  const userAgent = new UserAgent();
  const browser = await startBrowser();
  if (!browser) return;
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setViewport({
    width: 1200,
    height: 1000,
  });
  page.setDefaultTimeout(10000);
  if (!page) {
    Logger.error("Error occured, aborting..");
  }
  Logger.info(`Navigating to LinkedIn link, url: ${address};`);
  await page.goto(address, {
    waitUntil: "networkidle2",
  });
  return { page, browser };
};

const sendVerificationNoticeToEmail = async (page: puppeteer.Page) => {
  const cid = uuidv4();
  const screenShotTaken = await takeScreenshot(
    `crawlers/websites/linkedIn/images/${cid}.png`,
    page
  );
  if (screenShotTaken !== "OK") {
    Logger.error(screenShotTaken);
    return;
  }
  const mailOptions = {
    from: "Koren Ben-Ezri, FS developer <korenatdevelopes@gmail.com>",
    to: "korenatdevelopes@gmail.com",
    subject: "Get-A-Job: LinkedIn Security Verfication encountered.",
    text: "",
    html: `<p> Hi, this seems like a LinkedIn security verification. Url: ${page.url()} </p> \n\n
       <img src="cid:${cid}"/>`,
    attachments: [
      {
        filename: "image.png",
        path: `crawlers/websites/linkedIn/images/${cid}.png`,
        cid,
      },
    ],
  };
  await sendMail(mailOptions);
};
export const checkForSecurityCheck = async (page: puppeteer.Page) => {
  const isVerificationEnabled = await checkIfElementExistsByText(
    "h1",
    "quick security check",
    page
  );
  if (isVerificationEnabled) {
    Logger.http("Security check detected, sending screenshot as email..");
    await sleep(6000);
    await sendVerificationNoticeToEmail(page);
    return true;
  } else return false;
};

export const collectAllConnectButtons = async (page: puppeteer.Page) => {
  try {
    await page.waitForSelector(selectors.resultItemLiSelector);
  } catch ({ message }) {
    Logger.http(`Connection failed, checking for security checks...`);
    await checkForSecurityCheck(page);
    return;
  }
  const allConnectBtns = await page.$$eval(
    selectors.resultItemLiSelector,
    (elements: Element[]) =>
      elements.map((a: Element, index: number) => {
        return index;
      })
  );
  return allConnectBtns;
};

export const clickAddANoteBtn = async (page: puppeteer.Page) => {
  const { addANoteBtnText } = selectors;
  await clickElementByText("span", addANoteBtnText, page);
};

export const clickSendBtn = async (page: puppeteer.Page) => {
  const { sendInvitationBtnText } = selectors;
  await clickElementByText("span", sendInvitationBtnText, page);
};
export const sendConnectionInvite = async (page: puppeteer.Page) => {
  const { insideProfileConnectBtnSelector } = selectors;
  await clickElement(insideProfileConnectBtnSelector, page);
  await sleep(2000);
  await clickAddANoteBtn(page);
  await sleep(500);
  await fillInputField(
    "textarea[name=message]",
    "Hello! I'd like to add you as a connection",
    page
  );
  await sleep(200);
  await clickSendBtn(page);
  return "OK";
};
export const checkIfInviteIsBlocked = async (page: puppeteer.Page) => {
  const { alreadyInvitedText, sendInvitationBtnText } = selectors;
  const isAlreadyInvited = await checkIfElementExistsByText(
    "span",
    alreadyInvitedText,
    page
  );
  const doesInvitationBtnExist = await checkIfElementExistsByText(
    "span",
    sendInvitationBtnText,
    page
  );
  if (isAlreadyInvited || !doesInvitationBtnExist) return true;
  else return false;
};

export const clickUserProfile = async (
  page: puppeteer.Page,
  profileIndex: number
) => {
  const connectBtnSelector = `#main > div > div > div.ph0.pv2.artdeco-card.mb2 > ul > li:nth-child(${profileIndex})`;
  await withTryCatch(clickElement, [connectBtnSelector, page]);
  await page.waitForNavigation();
};

export const loginToLinkedIn = async (page: puppeteer.Page) => {
  dotenv.config();
  const userEmail = process.env.JOBMASTER_EMAIL || "";
  const userPassword = process.env.JOBMASTER_PASSWORD || "";
  await clickElement(selectors.emailInputSelector, page);
  await fillInputField(selectors.emailInputSelector, userEmail, page);
  await clickElement(selectors.passwordInputSelector, page);
  await fillInputField(selectors.passwordInputSelector, userPassword, page);
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle2" });
};

import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { sleep, fillInputField } from "../utils";
import { websiteSelectors } from "../utils";

dotenv.config();

const userPassword = process.env.USER_PASSWORD || "";
const userEmail = process.env.USER_EMAIL || "";

export const loginToWebsite = async (
  websiteName: string,
  page: puppeteer.Page
) => {
  const { usernameSelector, passwordSelector, submitButtonSelector } =
    websiteSelectors.glassdoor.selectors;

  await fillInputField(usernameSelector, userEmail, page);
  await fillInputField(passwordSelector, userPassword, page);

  await page.click(submitButtonSelector);
  await sleep(600);
  return;
};

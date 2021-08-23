import puppeteer from "puppeteer";
import { websiteSelectors } from "../utils";
import { sleep, fillInputField, clickElement } from "../utils";

export const enterJobSearch = async (
  websiteName: string,
  keywords: string[],
  page: puppeteer.Page
) => {
  const {
    selectors: {
      jobsSearchInputSelector,
      jobsButtonSelector,
      seeAllJobsLink,
      moreOptionsButton,
      applicationTypeDivSelector,
    },
  } = websiteSelectors.glassdoor;
  await clickElement(jobsButtonSelector, page);
  await fillInputField(jobsSearchInputSelector, keywords[0], page);
  await page.keyboard.press("Enter");
  await sleep(350);
  await clickElement(seeAllJobsLink, page);
  await sleep(500);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await clickElement(moreOptionsButton, page);
  await clickElement(applicationTypeDivSelector, page);
  await sleep(500);
  await sleep(500);
  return;
};

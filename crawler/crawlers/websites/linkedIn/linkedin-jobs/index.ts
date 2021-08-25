import puppeteer from "puppeteer";
import { jobSelectors } from "../linkedIn-selectors";
import {
  clickElement,
  withTryCatch,
  fillInputField,
  sleep,
  getElementAttrByTxt,
  appendToJsonArray,
} from "../../../utils";
import {
  checkIfInviteIsBlocked,
  clickUserProfile,
  collectAllConnectButtons,
  sendConnectionInvite,
} from "../linkedin-utils";
import Logger from "../../../../logger/logger";
// appendToJsonArray

const collectCompanyWebsiteLink = async (page: puppeteer.Page) => {
  const { applyOnCompanyWebsiteTextSelector } = jobSelectors;
  const applicationLink = await getElementAttrByTxt(
    "a",
    applyOnCompanyWebsiteTextSelector,
    page
  );
  return applicationLink?._remoteObject.value;
};
const saveLinksToJSON = async (links: string[]) => {
  Logger.info(`Saving ${links.length} job links...`);
  await appendToJsonArray(links, "saved-data/linkedIn/joblinks.json", true);
};
export const collectJobApplicationLinks = async (page: puppeteer.Page) => {
  const links: string[] = [];
  try {
    for (let i = 1; i < 100; i++) {
      if (links.length > 5) {
        await saveLinksToJSON(links);
        links.length = 0;
      }
      const listItemSelector = `#main-content > section.two-pane-serp-page__results-list > ul > li:nth-child(${i})`;
      await withTryCatch(clickElement, [listItemSelector, page]);
      await sleep(3000);
      try {
        const link = await collectCompanyWebsiteLink(page);
        if (link) links.push(link);
      } catch ({ message }) {
        if (message === "Cannot read property 'getProperty' of undefined")
          continue;
        else Logger.error(message);
      }
    }
  } catch ({ message }) {
    await saveLinksToJSON(links);
    Logger.error(message);
  }
};

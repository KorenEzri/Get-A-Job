import puppeteer from "puppeteer";
import { jobSelectors } from "../linkedIn-selectors";
import {
  getElementJSHandleAttrByTxt,
  appendToJsonArray,
} from "../../../scrape-utils";
import Logger from "../../../../logger/logger";

export const collectCompanyWebsiteLink = async (page: puppeteer.Page) => {
  const { applyOnCompanyWebsiteTextSelector } = jobSelectors;
  const applicationLink = await getElementJSHandleAttrByTxt(
    "a",
    applyOnCompanyWebsiteTextSelector,
    page
  );
  return applicationLink?._remoteObject.value;
};
export const saveLinksToJSON = async (links: string[]) => {
  Logger.info(`Saving ${links.length} job links...`);
  await appendToJsonArray(links, "saved-data/linkedIn/joblinks.json", true);
};

import puppeteer from "puppeteer";
import { clickElement, withTryCatch, sleep } from "../../../scrape-utils";
import Logger from "../../../../logger/logger";
import { collectCompanyWebsiteLink, saveLinksToJSON } from "../linkedin-utils";

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

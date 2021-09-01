import puppeteer from "puppeteer";
import { withTryCatch } from "../../../scrape-utils";
import {
  checkIfInviteIsBlocked,
  clickUserProfile,
  collectAllConnectButtons,
  sendConnectionInvite,
} from "../linkedin-utils";

export const addConnections = async (page: puppeteer.Page, count: number) => {
  const allConnectBtns = await collectAllConnectButtons(page);
  if (!allConnectBtns) return;
  let iterationCount = 0;
  for (let i = 1; i < allConnectBtns.length; i++) {
    if (iterationCount === count) return "OK";
    const connectBtnIndex = allConnectBtns[i];
    await clickUserProfile(page, connectBtnIndex);
    await checkIfInviteIsBlocked(page);
    const res = await withTryCatch(sendConnectionInvite, [page]);
    if (res === "OK") {
      await page.goBack({ waitUntil: "networkidle2" });
      allConnectBtns.filter((btn) => btn !== connectBtnIndex);
      iterationCount++;
    } else {
      await page.goBack({ waitUntil: "networkidle2" });
      continue;
    }
  }
};

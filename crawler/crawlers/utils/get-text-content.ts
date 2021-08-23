import puppeteer from "puppeteer";

export const getTextContent = async (
  selector: string,
  page: puppeteer.Page
) => {
  let textContent: string = "";
  await page.evaluate(() => {
    const el = document.getElementById(selector);
    textContent = el?.textContent || "";
  });
  return textContent;
};

import puppeteer from "puppeteer";

export const takeScreenshot = async (path: string, page: puppeteer.Page) => {
  try {
    await page.screenshot({
      path: path,
      fullPage: true,
    });
    return "OK";
  } catch ({ message }) {
    return message;
  }
};

import puppeteer from "puppeteer";

export const getTextContent = async (
  selector: string,
  page: puppeteer.Page
) => {
  const textContent = await page.$eval(selector, (el) => el.textContent);
  return (textContent?.replace(/\W/g, " ") || "").replace("  ", "\n");
};
export const getTextContentForJson = async (
  selector: string,
  page: puppeteer.Page
) => {
  const textContent = await page.$eval(selector, (el) => el.textContent);
  return (
    (textContent?.replace(/\s/g, "X") || "X")
      .replace(/XXXXX/g, " ")
      .replace(/X/g, " ") + ","
  );
};

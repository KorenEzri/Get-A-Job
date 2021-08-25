import puppeteer from "puppeteer";
export const getElementAttrByTxt = async (
  elementType: string,
  containsText: string,
  page: puppeteer.Page
) => {
  const [element] = await page.$x(
    `//${elementType}[contains(., '${containsText}')]`
  );
  return await element.getProperty("href");
};

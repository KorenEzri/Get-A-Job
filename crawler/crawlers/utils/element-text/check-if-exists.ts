import puppeteer from "puppeteer";

export const checkIfElementExistsByText = async (
  elementType: string,
  containsText: string,
  page: puppeteer.Page
) => {
  const [element] = await page.$x(
    `//${elementType}[contains(., '${containsText}')]`
  );
  console.log(await element.getProperty("href"));
  return element ? true : false;
};

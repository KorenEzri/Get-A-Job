import puppeteer from "puppeteer";

export const checkIfElementExistsByText = async (
  elementType: string,
  containsText: string,
  page: puppeteer.Page
) => {
  const [element] = await page.$x(
    `//${elementType}[contains(., '${containsText}')]`
  );
  return element ? true : false;
};

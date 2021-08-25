import puppeteer from "puppeteer";

export const clickElementByText = async (
  elementType: string,
  containsText: string,
  page: puppeteer.Page
) => {
  const [element] = await page.$x(
    `//${elementType}[contains(., '${containsText}')]`
  );
  if (element) {
    await element.click();
  }
};

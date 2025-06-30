import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import puppeteer from "puppeteer";
import path from "path";

export async function convertPdfFirstPageToImage(
  filePath: string
): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto(`file://${path.resolve(filePath)}#page=1`, {
    waitUntil: "networkidle0",
  });
  const screenshotPath = `${filePath.replace(/\.[^/.]+$/, "")}-preview.png`;
  await page.screenshot({ path: screenshotPath as `${string}.png` });
  await browser.close();

  const previewUpload = await cloudinary.uploader.upload(screenshotPath, {
    folder: "pdf-previews",
    resource_type: "image",
  });

  fs.unlinkSync(screenshotPath);
  return previewUpload.secure_url;
}

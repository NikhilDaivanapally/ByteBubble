import { v2 } from "cloudinary";
import path from "path";
import pdf from "pdf-poppler";
import fs from "fs";

export async function convertPdfFirstPageToImage(
  filePath: string
): Promise<string> {
  const outputDir = path.dirname(filePath);
  const outputPrefix = path.basename(filePath, path.extname(filePath));

  const options = {
    format: "png",
    out_dir: outputDir,
    out_prefix: outputPrefix,
    page: 1,
  };

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }
    await pdf.convert(filePath, options);
    const expectedImagePath = path.join(outputDir, `${outputPrefix}-1.png`);
    if (!fs.existsSync(expectedImagePath)) {
      throw new Error(`Expected image not found: ${expectedImagePath}`);
    }
    const previewUpload = await v2.uploader.upload(expectedImagePath, {
      folder: "pdf-previews",
      resource_type: "image",
    });
    fs.unlinkSync(expectedImagePath);
    return previewUpload.secure_url;
  } catch (error: any) {
    console.error("PDF conversion error:", error);
    throw new Error(`PDF conversion failed: ${error.message}`);
  }
}

interface PdfJsLib {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (data: { data: ArrayBuffer }) => {
    promise: Promise<PdfDocument>;
  };
}

interface PdfDocument {
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

interface PdfPage {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (context: PdfRenderContext) => { promise: Promise<void> };
}

interface PdfViewport {
  width: number;
  height: number;
  scale: number;
}

interface PdfRenderContext {
  canvasContext: CanvasRenderingContext2D;
  viewport: PdfViewport;
}

let pdfJsInitPromise: Promise<PdfJsLib> | null = null;

export const ensurePdfJsLoaded = (): Promise<PdfJsLib> => {
  if (pdfJsInitPromise) {
    return pdfJsInitPromise;
  }

  pdfJsInitPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;
    script.onload = () => {
      // Type assertion for window object to include PdfJsLib
      const pdfjs = (window as any)["pdfjs-dist/build/pdf"] as
        | PdfJsLib
        | undefined;
      if (pdfjs) {
        // Set the workerSrc for PDF.js, crucial for its functionality
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(pdfjs);
      } else {
        reject(
          new Error(
            "PDF.js library not found on window object after script load."
          )
        );
      }
    };
    script.onerror = () => {
      reject(
        new Error(
          "Failed to load PDF.js script. Please check your internet connection."
        )
      );
    };
    document.body.appendChild(script);
  });
  return pdfJsInitPromise;
};

export const generatePdfThumbnail = async (
  file: File
): Promise<{ file: File; imageUrl: string } | null> => {
  if (file.type !== "application/pdf") {
    console.error("generatePdfThumbnail: Provided file is not a PDF.");
    return null;
  }

  try {
    const pdfjsLib = await ensurePdfJsLoaded();

    const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("generatePdfThumbnail: Could not get canvas context.");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const imageUrl = canvas.toDataURL("image/webp");

    // Convert Data URL to Blob
    const blob = await (await fetch(imageUrl)).blob();

    const previewFile = new File(
      [blob],
      `${file.name.split(".")[0]}_preview.webp`,
      {
        type: "image/webp",
      }
    );

    return { file: previewFile, imageUrl };
  } catch (error) {
    console.error("generatePdfThumbnail: Error generating thumbnail", error);
    return null;
  }
};

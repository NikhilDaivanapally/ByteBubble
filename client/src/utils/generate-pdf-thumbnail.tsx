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
): Promise<string | null> => {
  // Validate file type
  if (file.type !== "application/pdf") {
    console.error("generatePdfThumbnail: Provided file is not a PDF.");
    return null;
  }

  try {
    // Ensure PDF.js is loaded before proceeding
    const pdfjsLib = await ensurePdfJsLoaded();

    // Read the file as an ArrayBuffer
    const reader = new FileReader();
    const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Get the first page of the PDF
    const page = await pdf.getPage(1);

    // Define the scale for rendering the page
    const scale = 1.5; // Adjust for higher/lower resolution
    const viewport = page.getViewport({ scale: scale });

    // Create a temporary canvas element to render the PDF page
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "generatePdfThumbnail: Could not get 2D rendering context for canvas."
      );
    }

    // Set canvas dimensions to match the viewport
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the PDF page onto the canvas
    const renderContext: PdfRenderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Convert the canvas content to a PNG image data URL
    const imageDataUrl = canvas.toDataURL("image/png");
    return imageDataUrl;
  } catch (error: any) {
    console.error(
      "generatePdfThumbnail: Error generating PDF thumbnail:",
      error
    );
    return null;
  }
};

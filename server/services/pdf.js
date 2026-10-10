import pdfParse from 'pdf-parse';

/**
 * Clean and normalize extracted text string
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Extracts page-by-page text from a PDF buffer.
 * Returns an object: { pageCount: N, pages: [{ pageNumber: 1, text: '...' }, ...] }
 */
export async function extractPdfPages(pdfBuffer) {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('Empty PDF file buffer provided.');
  }

  const pageTexts = [];

  const options = {
    pagerender: async function (pageData) {
      const renderOptions = {
        normalizeWhitespace: true,
        disableCombineTextItems: false
      };

      const textContent = await pageData.getTextContent(renderOptions);
      let pageText = '';
      
      for (const item of textContent.items) {
        pageText += item.str + ' ';
      }

      const cleanText = normalizeText(pageText);
      const pageNum = pageData.pageIndex + 1;

      pageTexts.push({
        pageNumber: pageNum,
        text: cleanText
      });

      return cleanText;
    }
  };

  try {
    const data = await pdfParse(pdfBuffer, options);
    
    // Sort pages in ascending order
    pageTexts.sort((a, b) => a.pageNumber - b.pageNumber);

    // Fallback if custom pagerender yielded no page objects but data.text exists
    if (pageTexts.length === 0 && data.text && data.text.trim()) {
      const fallbackPages = data.text.split('\n\n').filter(p => p.trim());
      fallbackPages.forEach((txt, idx) => {
        pageTexts.push({
          pageNumber: idx + 1,
          text: normalizeText(txt)
        });
      });
    }

    const totalTextLength = pageTexts.reduce((sum, p) => sum + (p.text ? p.text.length : 0), 0);

    // Detect image-based or empty PDFs
    if (totalTextLength < 10) {
      throw new Error('This PDF appears to contain no extractable text (it may be a scanned image or empty PDF). Text-based PDFs are required for Q&A indexing.');
    }

    return {
      pageCount: data.numpages || pageTexts.length || 1,
      pages: pageTexts.filter(p => p.text && p.text.length > 0)
    };
  } catch (err) {
    console.error('[PDF Parser] Error parsing PDF:', err.message);
    throw new Error(err.message || 'Failed to parse PDF document.');
  }
}

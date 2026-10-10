/**
 * Chunks page text into searchable snippets with overlapping boundaries.
 * Preserves document ID, page numbers, and index order.
 * 
 * Each chunk object format:
 * {
 *   id: "chunk_docId_p1_0",
 *   documentId: "doc_123",
 *   pageNumber: 1,
 *   chunkIndex: 0,
 *   text: "Actual text content...",
 *   tokenCount: 42
 * }
 */
export function chunkPages(documentId, pages, chunkSize = 500, overlap = 100) {
  if (!pages || !Array.isArray(pages) || pages.length === 0) {
    return [];
  }

  const chunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageText = page.text ? page.text.trim() : '';
    if (!pageText || pageText.length < 5) continue;

    // Split text into sentences / logical segments
    const sentences = pageText.match(/[^.!?]+[.!?]+(\s+|$)/g) || [pageText];
    
    let currentChunkText = '';

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      if ((currentChunkText + ' ' + sentence).length > chunkSize && currentChunkText.length > 0) {
        chunks.push({
          id: `chunk_${documentId}_p${page.pageNumber}_${globalChunkIndex}`,
          documentId,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex,
          text: currentChunkText.trim(),
          tokenCount: Math.round(currentChunkText.length / 4)
        });
        globalChunkIndex++;

        // Calculate overlap string from the end of currentChunkText
        const words = currentChunkText.split(' ');
        const overlapWordCount = Math.min(words.length, Math.round(overlap / 6));
        const overlapWords = words.slice(-overlapWordCount).join(' ');
        currentChunkText = (overlapWords + ' ' + sentence).trim();
      } else {
        currentChunkText += (currentChunkText ? ' ' : '') + sentence;
      }
    }

    if (currentChunkText && currentChunkText.trim().length > 5) {
      chunks.push({
        id: `chunk_${documentId}_p${page.pageNumber}_${globalChunkIndex}`,
        documentId,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex,
        text: currentChunkText.trim(),
        tokenCount: Math.round(currentChunkText.length / 4)
      });
      globalChunkIndex++;
    }
  }

  return chunks;
}

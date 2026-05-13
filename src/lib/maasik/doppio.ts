/**
 * Doppio.sh client for converting HTML to PDF.
 * Returns a Buffer of the PDF bytes.
 *
 * API docs: https://doc.doppio.sh/guide/render-methods/render-pdf-direct.html
 * - The `pdf` config must live INSIDE `page`, not as a sibling
 * - The `setContent.html` value must be base64-encoded
 */
export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const apiKey = process.env.DOPPIO_API_KEY;
  if (!apiKey) throw new Error('DOPPIO_API_KEY not set');

  // Doppio requires base64-encoded HTML in setContent.html
  const encodedHtml = Buffer.from(html, 'utf8').toString('base64');

  const response = await fetch('https://api.doppio.sh/v1/render/pdf/direct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: {
        setContent: {
          html: encodedHtml,
          options: { waitUntil: ['networkidle0'] },
        },
        pdf: {
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Doppio failed: ${response.status} ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
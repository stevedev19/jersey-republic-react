const htmlPdf = require('html-pdf-node');
const fs = require('fs');
const path = require('path');

async function convertHtmlToPdf() {
  try {
    // Read the HTML file
    const htmlContent = fs.readFileSync('JERSEY_REPUBLIC_CHANGES_DOCUMENTATION.html', 'utf8');
    
    // PDF options
    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Jersey Republic React - Creative Frontend Enhancements</div>',
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
    };
    
    // Convert HTML to PDF
    const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, options);
    
    // Write PDF file
    fs.writeFileSync('JERSEY_REPUBLIC_CHANGES_DOCUMENTATION.pdf', pdfBuffer);
    
    console.log('✅ PDF generated successfully: JERSEY_REPUBLIC_CHANGES_DOCUMENTATION.pdf');
    console.log('📄 File size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
  }
}

convertHtmlToPdf();

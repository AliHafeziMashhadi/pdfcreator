import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function setupPdfQuote() {
  document.getElementById("generate-pdf").addEventListener("click", handlePdfGeneration);
}

async function handlePdfGeneration() {
  const pickupAddress = document.getElementById("pickup-address").value;
  const pickupDate = document.getElementById("pickup-date").value;
  const requestReason = document.getElementById("request-reason").value;
  const customerName = document.getElementById("customer-name").value;
  const tierReason = document.getElementById("tier-reason").value;
  
  // Collect tier recommendations and rug data
  const tierSelections = Array.from(document.querySelectorAll('.rug-tier-select'))
    .map((select, index) => {
      const rugDiv = select.closest('.rug-tier-selection');
      const rugInfo = rugDiv.querySelector('label').textContent;
      const dimensions = rugInfo.match(/\((.*?)\)/)[1];
      return {
        rug: `Rug #${index + 1} (${dimensions})`,
        recommendedTier: select.value,
        dimensions: dimensions
      };
    });

  // Validate inputs
  if (!pickupAddress || !pickupDate || !requestReason || !customerName || !tierReason) {
    alert("Please fill in all required fields before generating the PDF quote.");
    return;
  }

  if (tierSelections.some(selection => !selection.recommendedTier)) {
    alert("Please select recommended tiers for all rugs.");
    return;
  }

  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add background image first
    const backgroundImg = new Image();
    backgroundImg.src = '/assets/babashbackground.png';
    
    await new Promise((resolve, reject) => {
      backgroundImg.onload = resolve;
      backgroundImg.onerror = reject;
    });

    // Add background (full page)
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(backgroundImg, 'PNG', 0, 0, pageWidth, pageHeight);

    // Add logo
    const headerImg = new Image();
    headerImg.src = '/assets/babash-logo.png';
    
    await new Promise((resolve, reject) => {
      headerImg.onload = resolve;
      headerImg.onerror = reject;
    });

    // Add header logo (scaled to 90% of original size and moved 9 points left)
    const logoWidth = (pageWidth - 40) * 0.9;
    const logoHeight = (logoWidth / headerImg.width) * headerImg.height;
    doc.addImage(headerImg, 'PNG', 9, 20, logoWidth, logoHeight);

    // Add address information
    const startY = logoHeight + 30;
    doc.setFontSize(10);
    doc.setTextColor(89, 89, 89);
    
    // San Fernando Valley Location
    doc.setFont(undefined, 'bold');
    doc.text("San Fernando Valley Location:", 20, startY);
    const sfvWidth = doc.getTextWidth("San Fernando Valley Location:");
    doc.setFont(undefined, 'normal');
    doc.text("8140 Deering Ave., Canoga Park, CA 91304", 20 + sfvWidth + 3, startY);
    
    // Los Angeles Location
    doc.setFont(undefined, 'bold');
    doc.text("Los Angeles Location:", 20, startY + 7.5);
    const laWidth = doc.getTextWidth("Los Angeles Location:");
    doc.setFont(undefined, 'normal');
    doc.text("10941 1/2 W Pico Blvd., Los Angeles, CA 90064", 20 + laWidth + 3, startY + 7.5);
    
    // Phone number
    doc.setFontSize(9);
    doc.text("+1(818)963-9153", 20, startY + 15);

    // Reset text color to black for remaining content
    doc.setTextColor(0, 0, 0);

    // Add title with adjusted space and increased font size
    doc.setFontSize(19);
    doc.setFont(undefined, 'bold');
    doc.text("Fire Damage Quote", 20, startY + 25);
    
    // Add horizontal line under title
    doc.setLineWidth(0.5);
    doc.line(20, startY + 27.5, pageWidth - 20, startY + 27.5);

    // Add date with increased font size
    const today = new Date();
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(today.toLocaleDateString(), 20, startY + 35);
    
    // Client details with bold labels
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Client Name:", 20, startY + 42.5);
    const clientNameWidth = doc.getTextWidth("Client Name:");
    doc.setFont(undefined, 'normal');
    doc.text(customerName, 20 + clientNameWidth + 2, startY + 42.5);

    doc.setFont(undefined, 'bold');
    doc.text("Pickup Address:", 20, startY + 50);
    const pickupAddressWidth = doc.getTextWidth("Pickup Address:");
    doc.setFont(undefined, 'normal');
    doc.text(pickupAddress, 20 + pickupAddressWidth + 2, startY + 50);

    doc.setFont(undefined, 'bold');
    doc.text("Date of Pickup:", 20, startY + 57.5);
    const pickupDateWidth = doc.getTextWidth("Date of Pickup:");
    doc.setFont(undefined, 'normal');
    doc.text(pickupDate, 20 + pickupDateWidth + 2, startY + 57.5);

    doc.setFont(undefined, 'bold');
    doc.text("Reason for Request:", 20, startY + 65);
    const requestReasonWidth = doc.getTextWidth("Reason for Request:");
    doc.setFont(undefined, 'normal');
    doc.text(requestReason, 20 + requestReasonWidth + 2, startY + 65);

    const tableHeaders = [
      ['Rug Description', 'Economy', 'Midrange', 'Premium', 'Pickup & Delivery Fee', 'Selected Tier', 'Selected Price']
    ];

    // Calculate total price
    let grandTotal = 0;
    const tableData = tierSelections.map((selection, index) => {
      const basePrice = 85 + (index * 5);
      const midPrice = basePrice * 1.8;
      const premPrice = basePrice * 2.6;
      const deliveryFee = basePrice * 0.1;
      const selectedPrice = premPrice + deliveryFee;
      grandTotal += selectedPrice;
      
      return [
        selection.rug,
        `$${basePrice.toFixed(2)}`,
        `$${midPrice.toFixed(2)}`,
        `$${premPrice.toFixed(2)}`,
        `$${deliveryFee.toFixed(2)}`,
        selection.recommendedTier,
        `$${selectedPrice.toFixed(2)}`
      ];
    });

    // Add Grand Total row
    const grandTotalRow = [
      'Grand Total', '', '', '', '', '', `$${grandTotal.toFixed(2)}`
    ];

    // Calculate table width to match the title underline
    const tableWidth = pageWidth - 40;
    const colWidth = tableWidth / 7;

    let currentY = startY + 72.5;
    let currentChunk = [];
    let pageStartY = currentY;
    let isFirstChunk = true;

    // Process table data row by row
    for (let i = 0; i < tableData.length; i++) {
      // Add row to current chunk
      currentChunk.push(tableData[i]);

      // Calculate approximate height of current chunk
      const approxRowHeight = 12;
      const tableHeight = (currentChunk.length + 1) * approxRowHeight;

      // Check if adding this row would exceed page boundary (60 points from bottom)
      if (pageStartY + tableHeight > pageHeight - 60) {
        // Get the current total rows processed
        const totalRowsProcessed = tableData.slice(0, i).length;
        
        // Draw current chunk
        doc.autoTable({
          head: tableHeaders,
          body: currentChunk.slice(0, -1),
          startY: pageStartY,
          margin: { left: 20, right: 20 },
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 2.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: colWidth },
            1: { cellWidth: colWidth },
            2: { cellWidth: colWidth },
            3: { cellWidth: colWidth },
            4: { cellWidth: colWidth },
            5: { cellWidth: colWidth },
            6: { cellWidth: colWidth }
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: {
            halign: 'left'
          },
          didDrawCell: function(data) {
            // Only draw horizontal lines
            if (data.row.section === 'head' || data.row.section === 'body') {
              const x1 = data.cell.x;
              const x2 = data.cell.x + data.cell.width;
              const y = data.cell.y + data.cell.height;
              
              if (data.row.index === data.table.body.length - 1 || data.row.section === 'head') {
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.1);
                doc.line(x1, y, x2, y);
              }
            }
            
            // Color alternating rows in the Rug Description column
            if (data.column.index === 0 && data.row.section === 'body') {
              const globalRowIndex = totalRowsProcessed + data.row.index;
              const color = globalRowIndex % 2 === 0 ? '#e37035' : '#7eba45';
              doc.setTextColor(...hexToRgb(color));
            } else if (data.row.section === 'body') {
              doc.setTextColor(0, 0, 0);
            }
          }
        });

        // Start new page
        doc.addPage();
        doc.addImage(backgroundImg, 'PNG', 0, 0, pageWidth, pageHeight);
        
        // Add continuation header
        doc.setFontSize(19);
        doc.setFont(undefined, 'bold');
        doc.text("Fire Damage Quote (Cont.)", 20, 51);
        
        // Add horizontal line under continuation header
        doc.setLineWidth(0.5);
        doc.line(20, 53.5, pageWidth - 20, 53.5);
        
        // Reset for new page
        pageStartY = 66;
        currentChunk = [tableData[i]];
        isFirstChunk = false;
      }
    }

    // Draw remaining rows and grand total
    if (currentChunk.length > 0) {
      const totalRowsProcessed = tableData.length - currentChunk.length;
      currentChunk.push(grandTotalRow);
      doc.autoTable({
        head: tableHeaders,
        body: currentChunk,
        startY: pageStartY,
        margin: { left: 20, right: 20 },
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: colWidth },
          1: { cellWidth: colWidth },
          2: { cellWidth: colWidth },
          3: { cellWidth: colWidth },
          4: { cellWidth: colWidth },
          5: { cellWidth: colWidth },
          6: { cellWidth: colWidth }
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          halign: 'left'
        },
        didDrawCell: function(data) {
          // Only draw horizontal lines
          if (data.row.section === 'head' || data.row.section === 'body') {
            const x1 = data.cell.x;
            const x2 = data.cell.x + data.cell.width;
            const y = data.cell.y + data.cell.height;
            
            if (data.row.index === data.table.body.length - 1 || data.row.section === 'head') {
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.1);
              doc.line(x1, y, x2, y);
            }
          }
          
          if (data.row.section === 'body' && data.row.index < currentChunk.length - 1) {
            if (data.column.index === 0) {
              const globalRowIndex = totalRowsProcessed + data.row.index;
              const color = globalRowIndex % 2 === 0 ? '#e37035' : '#7eba45';
              doc.setTextColor(...hexToRgb(color));
            } else {
              doc.setTextColor(0, 0, 0);
            }
          }
          // Style the Grand Total row
          if (data.row.index === currentChunk.length - 1) {
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
          }
        }
      });
    }

    currentY = doc.lastAutoTable.finalY + 15;

    // Add Reason for Tier Selections
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Reason for Tier Selections:", 20, currentY);
    
    // Add tier reason text with word wrap
    doc.setFont(undefined, 'normal');
    const splitTierReason = doc.splitTextToSize(tierReason, pageWidth - 40);
    doc.text(splitTierReason, 20, currentY + 7);

    // Update currentY after tier reason
    currentY += 7 + (splitTierReason.length * 5) + 10;

    // Add gray separator line
    doc.setDrawColor(89, 89, 89);
    doc.setLineWidth(0.5);
    doc.line(20, currentY - 5, pageWidth - 20, currentY - 5);

    // Add Additional Notes section with proper spacing
    doc.setFontSize(10);
    doc.setTextColor(89, 89, 89);
    doc.setFont(undefined, 'bold');
    doc.text("Additional Notes:", 20, currentY);
    doc.setFont(undefined, 'normal');

    const additionalNotes = [
      "Pickup & delivery fee based on our standard scheduling, with a two hour time window provided.",
      "Prices depend on rug size and condition, once measured by our technicians this estimate may change.",
      "If washing does not solve problems observed, additional solutions may be available and will be quoted once a sample is successfully performed."
    ];

    // Add each note with halved spacing (5 points instead of 10)
    currentY += 7;
    additionalNotes.forEach((note, index) => {
      const splitNote = doc.splitTextToSize(note, pageWidth - 40);
      doc.text(splitNote, 20, currentY + (index * 5));
    });

    // Reset text color to black for page numbers
    doc.setTextColor(0, 0, 0);

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(13);
      doc.text(String(i), 10, doc.internal.pageSize.height - 11);
    }

    // Save the PDF
    doc.save(`${customerName.replace(/\s+/g, '_')}_rug_quote.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try again.');
  }
}

// Helper function to convert hex color to RGB array
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

export function updatePdfSection(rugsData) {
  const pdfSection = document.getElementById("pdf-quote-section");
  const rugTierRecommendations = document.getElementById("rug-tier-recommendations");
  pdfSection.style.display = "block";
  
  // Clear previous recommendations
  rugTierRecommendations.innerHTML = "";
  
  // Add tier selection for each rug
  rugsData.forEach((rug, index) => {
    const rugDiv = document.createElement("div");
    rugDiv.className = "rug-tier-selection";
    rugDiv.innerHTML = `
      <label for="rug-tier-${index + 1}">Rug #${index + 1} (${rug.display}):</label>
      <select id="rug-tier-${index + 1}" class="rug-tier-select">
        <option value="">Select recommended tier</option>
        <option value="Economy">Economy</option>
        <option value="Midrange">Midrange</option>
        <option value="Premium">Premium</option>
      </select>
    `;
    rugTierRecommendations.appendChild(rugDiv);
  });
}
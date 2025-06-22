
import * as XLSX from 'xlsx';
import { Transaction } from "@/types/transaction";

export const exportToExcel = (transactions: Transaction[]) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare the data with headers
  const headers = [
    'Customer Name',
    'Payment Date',
    'Month Paid For',
    'Amount ($)',
    'Payment Method',
    'MoMo Transaction ID'
  ];

  // Transform transactions data
  const data = [
    headers,
    ...transactions.map(transaction => [
      transaction.customerName,
      transaction.paymentDate,
      transaction.monthPaidFor,
      `$${transaction.amount.toFixed(2)}`,
      transaction.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money',
      transaction.momoTransactionId || 'N/A'
    ])
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Customer Name
    { wch: 15 }, // Payment Date
    { wch: 18 }, // Month Paid For
    { wch: 12 }, // Amount
    { wch: 16 }, // Payment Method
    { wch: 20 }  // MoMo Transaction ID
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F1');
  
  // Apply header styling (basic styling that works with xlsx)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };
    
    // Set cell style properties
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "16A34A" } }, // Green background
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
  }

  // Style data rows with alternating colors
  for (let row = 1; row <= transactions.length; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        fill: { 
          fgColor: { 
            rgb: row % 2 === 0 ? "F0FDF4" : "FFFFFF" // Light green for even rows
          } 
        },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          left: { style: "thin", color: { rgb: "E5E7EB" } },
          right: { style: "thin", color: { rgb: "E5E7EB" } }
        },
        alignment: { 
          horizontal: col === 3 ? "right" : "left" // Right align amount column
        }
      };
    }
  }

  // Add summary section
  const summaryStartRow = transactions.length + 3;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const uniqueCustomers = new Set(transactions.map(t => t.customerName)).size;

  // Add summary data
  const summaryData = [
    ['SUMMARY', '', '', '', '', ''],
    ['Total Income:', `$${totalAmount.toFixed(2)}`, '', '', '', ''],
    ['Total Transactions:', totalTransactions.toString(), '', '', '', ''],
    ['Unique Customers:', uniqueCustomers.toString(), '', '', '', '']
  ];

  // Add summary to worksheet
  XLSX.utils.sheet_add_aoa(worksheet, summaryData, { origin: `A${summaryStartRow}` });

  // Style summary section
  for (let i = 0; i < summaryData.length; i++) {
    const rowIndex = summaryStartRow + i - 1;
    
    if (i === 0) {
      // Summary header
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, size: 14, color: { rgb: "16A34A" } },
          fill: { fgColor: { rgb: "F0FDF4" } },
          alignment: { horizontal: "center" }
        };
      }
    } else {
      // Summary data
      for (let col = 0; col < 2; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: col === 0 },
            fill: { fgColor: { rgb: "F9FAFB" } },
            alignment: { horizontal: col === 0 ? "left" : "right" }
          };
        }
      }
    }
  }

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rent Payments');

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `rent-payments-${currentDate}.xlsx`;

  // Write and download the file
  XLSX.writeFile(workbook, filename);
};

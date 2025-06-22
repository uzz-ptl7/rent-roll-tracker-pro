
import * as XLSX from 'xlsx';
import { Transaction } from "@/types/transaction";

export const exportToExcel = (transactions: Transaction[]) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Calculate summary data
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const uniqueCustomers = new Set(transactions.map(t => t.customerName)).size;

  // Create summary section data
  const summaryData = [
    ['RENT PAYMENTS SUMMARY', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Total Income:', `$${totalAmount.toFixed(2)}`, '', '', '', ''],
    ['Total Transactions:', totalTransactions.toString(), '', '', '', ''],
    ['Unique Customers:', uniqueCustomers.toString(), '', '', '', ''],
    ['Report Date:', new Date().toLocaleDateString(), '', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', '']
  ];

  // Prepare transaction table headers
  const headers = [
    'Customer Name',
    'Payment Date',
    'Month Paid For',
    'Amount ($)',
    'Payment Method',
    'MoMo Transaction ID'
  ];

  // Transform transactions data
  const transactionData = [
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

  // Combine summary and transaction data
  const allData = [
    ...summaryData,
    ...transactionData
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allData);

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

  // Style the summary section
  const summaryHeaderCell = 'A1';
  if (worksheet[summaryHeaderCell]) {
    worksheet[summaryHeaderCell].s = {
      font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F2937" } }, // Dark gray background
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        left: { style: "thick", color: { rgb: "000000" } },
        right: { style: "thick", color: { rgb: "000000" } }
      }
    };
  }

  // Style summary data rows (rows 3-6)
  for (let row = 2; row <= 5; row++) {
    for (let col = 0; col < 2; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: col === 0, size: 11 },
          fill: { fgColor: { rgb: col === 0 ? "E5E7EB" : "F3F4F6" } }, // Light gray backgrounds
          alignment: { horizontal: col === 0 ? "left" : "right" },
          border: {
            top: { style: "thin", color: { rgb: "9CA3AF" } },
            bottom: { style: "thin", color: { rgb: "9CA3AF" } },
            left: { style: "thin", color: { rgb: "9CA3AF" } },
            right: { style: "thin", color: { rgb: "9CA3AF" } }
          }
        };
      }
    }
  }

  // Style transaction table headers (row 9, index 8)
  const headerRowIndex = summaryData.length;
  for (let col = 0; col < headers.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
        fill: { fgColor: { rgb: "059669" } }, // Emerald green background
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thick", color: { rgb: "000000" } },
          bottom: { style: "thick", color: { rgb: "000000" } },
          left: { style: "thick", color: { rgb: "000000" } },
          right: { style: "thick", color: { rgb: "000000" } }
        }
      };
    }
  }

  // Style transaction data rows with alternating colors
  for (let row = 0; row < transactions.length; row++) {
    const actualRowIndex = headerRowIndex + 1 + row;
    for (let col = 0; col < headers.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: actualRowIndex, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          fill: { 
            fgColor: { 
              rgb: row % 2 === 0 ? "DCFCE7" : "F0FDF4" // Light green alternating colors
            } 
          },
          border: {
            top: { style: "thin", color: { rgb: "10B981" } },
            bottom: { style: "thin", color: { rgb: "10B981" } },
            left: { style: "thin", color: { rgb: "10B981" } },
            right: { style: "thin", color: { rgb: "10B981" } }
          },
          alignment: { 
            horizontal: col === 3 ? "right" : "left" // Right align amount column
          }
        };
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

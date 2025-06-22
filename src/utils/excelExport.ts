
import { Transaction } from "@/types/transaction";

export const exportToExcel = (transactions: Transaction[]) => {
  // Create CSV content
  const headers = [
    'Customer Name',
    'Payment Date',
    'Month Paid For',
    'Amount',
    'Payment Method',
    'MoMo Transaction ID'
  ];

  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      `"${transaction.customerName}"`,
      transaction.paymentDate,
      `"${transaction.monthPaidFor}"`,
      transaction.amount.toFixed(2),
      transaction.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money',
      transaction.momoTransactionId || ''
    ].join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rent-payments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


export interface Transaction {
  id: string;
  customerName: string;
  paymentDate: string;
  monthPaidFor: string;
  paymentMethod: 'cash' | 'mobilemoney';
  amount: number;
  momoTransactionId?: string;
}

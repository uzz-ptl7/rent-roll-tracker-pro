
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Transaction } from "@/types/transaction";

interface SummarySectionProps {
  transactions: Transaction[];
}

const SummarySection: React.FC<SummarySectionProps> = ({ transactions }) => {
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalTransactions = transactions.length;
  const cashTransactions = transactions.filter(t => t.paymentMethod === 'cash');
  const mobileMoneyTransactions = transactions.filter(t => t.paymentMethod === 'mobilemoney');
  
  const totalCashAmount = cashTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalMobileMoneyAmount = mobileMoneyTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {totalAmount.toLocaleString()} RWF
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalTransactions}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cash Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalCashAmount.toLocaleString()} RWF
          </div>
          <p className="text-xs text-muted-foreground">
            {cashTransactions.length} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mobile Money
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalMobileMoneyAmount.toLocaleString()} RWF
          </div>
          <p className="text-xs text-muted-foreground">
            {mobileMoneyTransactions.length} transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummarySection;

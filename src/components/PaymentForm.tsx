
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/transaction";

interface PaymentFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  onSubmit, 
  editingTransaction, 
  onCancelEdit 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [monthPaidFor, setMonthPaidFor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobilemoney'>('cash');
  const [amount, setAmount] = useState('');
  const [momoTransactionId, setMomoTransactionId] = useState('');
  const [customers] = useState([
    'John Smith', 'Mary Johnson', 'David Brown', 'Sarah Wilson', 'Michael Davis'
  ]);

  useEffect(() => {
    if (editingTransaction) {
      setCustomerName(editingTransaction.customerName);
      setPaymentDate(new Date(editingTransaction.paymentDate));
      setMonthPaidFor(editingTransaction.monthPaidFor);
      setPaymentMethod(editingTransaction.paymentMethod);
      setAmount(editingTransaction.amount.toString());
      setMomoTransactionId(editingTransaction.momoTransactionId || '');
    }
  }, [editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !paymentDate || !monthPaidFor || !amount) {
      return;
    }

    const transactionData = {
      customerName,
      paymentDate: paymentDate.toISOString().split('T')[0],
      monthPaidFor,
      paymentMethod,
      amount: parseFloat(amount),
      ...(paymentMethod === 'mobilemoney' && momoTransactionId && { momoTransactionId }),
    };

    if (editingTransaction) {
      onSubmit({ ...transactionData, id: editingTransaction.id });
    } else {
      onSubmit(transactionData);
    }

    // Reset form
    setCustomerName('');
    setPaymentDate(undefined);
    setMonthPaidFor('');
    setPaymentMethod('cash');
    setAmount('');
    setMomoTransactionId('');
  };

  const handleCancel = () => {
    setCustomerName('');
    setPaymentDate(undefined);
    setMonthPaidFor('');
    setPaymentMethod('cash');
    setAmount('');
    setMomoTransactionId('');
    onCancelEdit?.();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const monthOptions = months.flatMap(month => [
    `${month} ${currentYear}`,
    `${month} ${currentYear + 1}`
  ]);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>
          {editingTransaction ? 'Edit Payment' : 'Add New Payment'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Select value={customerName} onValueChange={setCustomerName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {customers.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month Paid For</Label>
              <Select value={monthPaidFor} onValueChange={setMonthPaidFor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50 max-h-60">
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: 'cash' | 'mobilemoney') => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobilemoney">Mobile Money (MoMo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            {paymentMethod === 'mobilemoney' && (
              <div className="space-y-2">
                <Label htmlFor="momo-id">MoMo Transaction ID</Label>
                <Input
                  id="momo-id"
                  value={momoTransactionId}
                  onChange={(e) => setMomoTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
            >
              {editingTransaction ? 'Update Payment' : 'Add Payment'}
            </Button>
            {editingTransaction && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;

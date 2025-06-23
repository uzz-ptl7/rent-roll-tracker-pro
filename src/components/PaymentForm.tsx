import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient<Database> = supabaseClient as SupabaseClient<Database>;

export interface Transaction {
  id?: string | number; // id optional for new transactions
  customerName: string;
  paymentDate: string; // ISO date string
  monthPaidFor: string;
  paymentMethod: 'cash' | 'mobilemoney';
  amount: number;
  momoTransactionId?: string | null;
}

interface PaymentFormProps {
  onSubmit: (transaction: Transaction) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  editingTransaction,
  onCancelEdit
}) => {
  const [customerName, setCustomerName] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined);
  const [monthPaidFor, setMonthPaidFor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobilemoney'>('cash');
  const [amount, setAmount] = useState('');
  const [momoTransactionId, setMomoTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Your customer list — update or load dynamically as you want
  const [customers] = useState([
    'John Smith', 'Mary Johnson', 'David Brown', 'Sarah Wilson', 'Michael Davis'
  ]);

  // Load values if editing
  useEffect(() => {
    if (editingTransaction) {
      setCustomerName(editingTransaction.customerName);
      setPaymentDate(new Date(editingTransaction.paymentDate));
      setMonthPaidFor(editingTransaction.monthPaidFor);
      setPaymentMethod(editingTransaction.paymentMethod);
      setAmount(editingTransaction.amount.toString());
      setMomoTransactionId(editingTransaction.momoTransactionId || '');
    } else {
      // Clear form if not editing
      setCustomerName('');
      setPaymentDate(undefined);
      setMonthPaidFor('');
      setPaymentMethod('cash');
      setAmount('');
      setMomoTransactionId('');
    }
  }, [editingTransaction]);

  // Clear MoMo ID if payment method changes to cash
  useEffect(() => {
    if (paymentMethod === 'cash') {
      setMomoTransactionId('');
    }
  }, [paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !paymentDate || !monthPaidFor || !amount || isNaN(Number(amount))) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    const transaction: Transaction = {
      customerName,
      paymentDate: format(paymentDate, 'yyyy-MM-dd'),
      monthPaidFor,
      paymentMethod,
      amount: parseFloat(amount),
      momoTransactionId: paymentMethod === 'mobilemoney' ? momoTransactionId || null : null,
    };

    if (editingTransaction && editingTransaction.id) {
      transaction.id = editingTransaction.id;
    }

    onSubmit(transaction);

    setIsSubmitting(false);
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
    `${month} ${currentYear}`, `${month} ${currentYear + 1}`
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
              <Label htmlFor="customerName">Customer Name</Label>
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
              <Label htmlFor="monthPaidFor">Month Paid For</Label>
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
              <Label htmlFor="paymentMethod">Payment Method</Label>
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
              <Label htmlFor="amount">Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in RWF"
                required
              />
            </div>

            {paymentMethod === 'mobilemoney' && (
              <div className="space-y-2">
                <Label htmlFor="momoTransactionId">MoMo Transaction ID</Label>
                <Input
                  id="momoTransactionId"
                  value={momoTransactionId}
                  onChange={(e) => setMomoTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? (editingTransaction ? 'Updating...' : 'Adding...')
                : (editingTransaction ? 'Update Payment' : 'Add Payment')}
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

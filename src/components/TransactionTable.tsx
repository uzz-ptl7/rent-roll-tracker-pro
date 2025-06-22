
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Delete } from "lucide-react";
import { Transaction } from "@/types/transaction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  if (transactions.length === 0) {
    return (
      <Card className="bg-white border-green-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No transactions recorded yet</p>
            <p className="text-gray-400">Add your first payment to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-green-200">
                <TableHead className="text-green-700">Customer</TableHead>
                <TableHead className="text-green-700">Payment Date</TableHead>
                <TableHead className="text-green-700">Month Paid For</TableHead>
                <TableHead className="text-green-700">Amount</TableHead>
                <TableHead className="text-green-700">Payment Method</TableHead>
                <TableHead className="text-green-700">Transaction ID</TableHead>
                <TableHead className="text-green-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-green-100 hover:bg-green-50/50">
                  <TableCell className="font-medium">{transaction.customerName}</TableCell>
                  <TableCell>{new Date(transaction.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.monthPaidFor}</TableCell>
                  <TableCell className="font-semibold text-green-700">
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.paymentMethod === 'cash' ? 'secondary' : 'default'}
                      className={transaction.paymentMethod === 'cash' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {transaction.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.momoTransactionId || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Delete className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payment record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(transaction.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;

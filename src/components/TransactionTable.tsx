import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
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
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg">No transactions recorded yet</p>
            <p className="text-muted-foreground/70">Add your first payment to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Payment Date</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">Month Paid For</TableHead>
                <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Payment Method</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Transaction ID</TableHead>
                <TableHead className="text-xs sm:text-sm text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <div>
                      <div>{transaction.customerName}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {new Date(transaction.paymentDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {transaction.monthPaidFor}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                    {new Date(transaction.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                    {transaction.monthPaidFor}
                  </TableCell>
                  <TableCell className="font-semibold text-primary text-xs sm:text-sm">
                    <div>
                      RWF {transaction.amount.toFixed(2)}
                      <div className="lg:hidden">
                        <Badge 
                          variant={transaction.paymentMethod === 'cash' ? 'secondary' : 'default'}
                          className="text-xs mt-1"
                        >
                          {transaction.paymentMethod === 'cash' ? 'Cash' : 'MoMo'}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                    <Badge 
                      variant={transaction.paymentMethod === 'cash' ? 'secondary' : 'default'}
                    >
                      {transaction.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                    {transaction.momoTransactionId || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 sm:gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card">
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
                              className="bg-destructive hover:bg-destructive/90"
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

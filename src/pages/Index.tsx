import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileSpreadsheet } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import TransactionTable from "@/components/TransactionTable";
import { Transaction } from "@/types/transaction";
import { exportToExcel } from "@/utils/excelExport";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("add-payment");

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Payment Added",
      description: "Rent payment has been successfully recorded.",
    });
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
    setEditingTransaction(null);
    setActiveTab("transactions");
    toast({
      title: "Payment Updated",
      description: "Rent payment has been successfully updated.",
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Payment Deleted",
      description: "Rent payment has been successfully deleted.",
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveTab("add-payment");
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setActiveTab("transactions");
  };

  const handleExportToExcel = () => {
    if (transactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions to export.",
        variant: "destructive",
      });
      return;
    }
    
    exportToExcel(transactions);
    toast({
      title: "Export Successful",
      description: "Transactions have been exported to Excel.",
    });
  };

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyStats = transactions.reduce((acc, t) => {
    const key = t.monthPaidFor;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-green-800">Rent Roll Tracker Pro</h1>
          <p className="text-green-600 text-lg">Manage your rental income with ease</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-700">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                ${totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-700">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {transactions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-700">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {new Set(transactions.map(t => t.customerName)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-green-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-green-800">Rent Management</CardTitle>
                <CardDescription>Track and manage your rental payments</CardDescription>
              </div>
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-green-100">
                <TabsTrigger 
                  value="add-payment" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  Transaction List
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="add-payment" className="mt-6">
                <PaymentForm 
                  onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                  editingTransaction={editingTransaction}
                  onCancelEdit={handleCancelEdit}
                />
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-6">
                <TransactionTable 
                  transactions={transactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

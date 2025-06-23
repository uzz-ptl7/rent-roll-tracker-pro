import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileSpreadsheet, LogOut } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import TransactionTable from "@/components/TransactionTable";
import LoginForm from "@/components/LoginForm";
import PasswordSettings from "@/components/PasswordSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Transaction } from "@/types/transaction";
import { exportToExcel } from "@/utils/excelExport";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { isAuthenticated, logout, saveTransactions, loadTransactions } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("add-payment");

  // Load transactions from localStorage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadedTransactions = loadTransactions();
      setTransactions(loadedTransactions);
    }
  }, [isAuthenticated, loadTransactions]);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    if (isAuthenticated && transactions.length >= 0) {
      saveTransactions(transactions);
    }
  }, [transactions, isAuthenticated, saveTransactions]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
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

  const handleLogout = () => {
    logout();
    setTransactions([]);
    setEditingTransaction(null);
    setActiveTab("add-payment");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyStats = transactions.reduce((acc, t) => {
    const key = t.monthPaidFor;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Rent Roll Tracker Pro</h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Manage your rental income with ease</p>
            </div>
            <div className="flex justify-center sm:justify-end gap-2 flex-wrap">
              <ThemeToggle />
              <PasswordSettings />
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                ${totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {transactions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {new Set(transactions.map(t => t.customerName)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Rent Management</CardTitle>
                <CardDescription className="text-sm">Track and manage your rental payments</CardDescription>
              </div>
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger 
                  value="add-payment" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Add Payment</span>
                  <span className="xs:hidden">Add</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                >
                  <span className="hidden xs:inline">Transaction List</span>
                  <span className="xs:hidden">List</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="add-payment" className="mt-4 sm:mt-6">
                <PaymentForm 
                  onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                  editingTransaction={editingTransaction}
                  onCancelEdit={handleCancelEdit}
                />
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-4 sm:mt-6">
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

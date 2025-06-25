
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, LogOut } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import { Transaction } from "@/types/transaction";
import TransactionTable from "@/components/TransactionTable";
import SummarySection from "@/components/SummarySection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface MainDashboardProps {
  user: import('@supabase/supabase-js').User;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("add-payment");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("paymentdate", { ascending: false });

    if (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions.",
        variant: "destructive",
      });
      setTransactions([]);
    } else {
      const mapped = data.map((item: any) => ({
        id: String(item.id),
        customerName: item.customername,
        paymentDate: item.paymentdate,
        monthPaidFor: item.monthpaidfor,
        paymentMethod: item.paymentmethod as "cash" | "mobilemoney",
        amount: item.amount,
        momoTransactionId: item.momotransactionid,
      }));
      setTransactions(mapped);
    }
    setLoading(false);
  };

  // Handler to add a new transaction
  const handleAddTransaction = async (transaction: Transaction) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add transactions.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        customername: transaction.customerName,
        paymentdate: transaction.paymentDate,
        monthpaidfor: transaction.monthPaidFor,
        paymentmethod: transaction.paymentMethod,
        amount: transaction.amount,
        momotransactionid: transaction.momoTransactionId,
        user_id: user.id,
      },
    ]);
    if (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });
      fetchTransactions();
      setActiveTab("transactions");
    }
  };

  // Handler to update an existing transaction
  const handleUpdateTransaction = async (transaction: Transaction) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update transactions.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .update({
        customername: transaction.customerName,
        paymentdate: transaction.paymentDate,
        monthpaidfor: transaction.monthPaidFor,
        paymentmethod: transaction.paymentMethod,
        amount: transaction.amount,
        momotransactionid: transaction.momoTransactionId,
      })
      .eq("id", Number(transaction.id))
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to update transaction.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction updated successfully.",
      });
      setEditingTransaction(null);
      fetchTransactions();
      setActiveTab("transactions");
    }
  };

  // Handler to delete a transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete transactions.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", Number(transactionId))
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
      fetchTransactions();
    }
  };

  // Export to Excel with styling and summary
  const handleExportToExcel = () => {
    if (transactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions to export.",
        variant: "destructive",
      });
      return;
    }

    // Calculate summary data
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Prepare summary rows
    const summaryRows = [
      ["Summary"],
      [`Total Transactions:`, totalTransactions],
      [`Total Amount (RWF):`, totalAmount],
      [], // empty row before data
    ];

    // Prepare transaction data rows (headers + data)
    const header = ["Customer Name", "Payment Date", "Month Paid For", "Payment Method", "Amount (RWF)", "MoMo Transaction ID"];
    const dataRows = transactions.map(t => [
      t.customerName,
      t.paymentDate,
      t.monthPaidFor,
      t.paymentMethod,
      t.amount,
      t.momoTransactionId || "",
    ]);

    // Combine summary and data
    const worksheetData = [...summaryRows, header, ...dataRows];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Style header row (summary header + column headers)
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    // Bold "Summary" title in A1
    worksheet["A1"].s = {
      font: { bold: true, sz: 14 },
    };

    // Bold summary labels (A2, A3)
    ["A2", "A3"].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true },
        };
      }
    });

    // Bold header row (A5:F5)
    for (let C = 0; C <= 5; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: 4, c: C });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "B29DD9" } }, // light purple background
          alignment: { horizontal: "center" },
        };
      }
    }

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Payment Date
      { wch: 18 }, // Month Paid For
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Amount (RWF)
      { wch: 25 }, // MoMo Transaction ID
    ];

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Write file
    XLSX.writeFile(workbook, "rent_transactions.xlsx");

    toast({
      title: "Export Successful",
      description: "Transactions have been exported to Excel with summary.",
    });
  };

  if (loading) {
    return <div className="p-6">Loading transactions...</div>;
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-background">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Rent Roll Tracker Pro</CardTitle>
            <CardDescription>Manage your rental income with ease</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportToExcel} variant="outline" size="sm" className="flex items-center hover:border-purple-600 duration-700">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-none hover:border-purple-600 duration-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SummarySection transactions={transactions} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="add-payment">Add Payment</TabsTrigger>
              <TabsTrigger value="transactions">Transaction List</TabsTrigger>
            </TabsList>

            <TabsContent value="add-payment">
              <PaymentForm
                onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                editingTransaction={editingTransaction}
                onCancelEdit={() => {
                  setEditingTransaction(null);
                  setActiveTab("transactions");
                }}
              />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionTable
                transactions={transactions}
                onEdit={(transaction) => {
                  setEditingTransaction(transaction);
                  setActiveTab("add-payment");
                }}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainDashboard;

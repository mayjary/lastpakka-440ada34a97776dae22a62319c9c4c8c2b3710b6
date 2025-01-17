"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Transaction } from "@/types/transaction";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { Skeleton } from "../ui/skeleton";

const TransactionForm = ({
  transaction,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
}) => {
  const [formTransaction, setFormTransaction] = useState<Transaction>(transaction);

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setFormTransaction((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formTransaction);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formTransaction.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formTransaction.amount}
            onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={formTransaction.type}
            onChange={(e) => handleInputChange("type", e.target.value as "income" | "expense")}
            className="w-full p-2 border rounded"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formTransaction.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formTransaction.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save</Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </form>
  );
};

const RecentTransactionsCard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);


  const fetchTransactions = async () => {
    setLoading(true);
    try {
      console.log("Fetching transactions...");
      const response = await fetch(`/api/transactions?email=${user?.email}`);
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched transactions:", data);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      console.log("Saving transaction:", transaction);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...transaction, email: user?.email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save transaction: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      console.log("Save transaction result:", result);
      toast.success(transaction.id ? "Transaction updated successfully!" : "Transaction added successfully!");
      fetchTransactions();
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error(error.message || "Failed to save transaction.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, email: user?.email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete transaction: ${response.status} ${response.statusText}`);
      }
      toast.success("Transaction deleted successfully!");
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(error.message || "Failed to delete transaction.");
    }
  };

  useEffect(() => {
    const fetchUserAndTransactions = async () => {
      const loggedInUser = await getLoggedInUser();
      setUser(loggedInUser);
      if (loggedInUser?.email) {
        fetchTransactions();
      }
    };
    fetchUserAndTransactions();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>Enter the details of your new transaction.</DialogDescription>
            </DialogHeader>
            <TransactionForm
              transaction={{
                description: "",
                amount: 0,
                type: "expense",
                category: "",
                date: new Date().toISOString().split('T')[0],
              }}
              onSave={handleSaveTransaction}
              onClose={() => {}}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>
            <Skeleton className="w-[100px] h-[20px] rounded-full" /><p></p>
            <Skeleton className="w-[100px] h-[20px] rounded-full" /><p></p>
            <Skeleton className="w-[100px] h-[20px] rounded-full" /><p></p>
        </div>
        ) : (
          <ul className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <li key={transaction.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  {/* <p className="text-sm text-muted-foreground">{transaction.date}</p> */}
                </div>
                <div className="flex items-center space-x-2">
                  <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"} ${transaction.amount.toFixed(2)}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(transaction)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Make changes to your transaction here.</DialogDescription>
                      </DialogHeader>
                      {editingTransaction && (
                        <TransactionForm
                          transaction={editingTransaction}
                          onSave={handleSaveTransaction}
                          onClose={() => setEditingTransaction(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;


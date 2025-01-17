"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from 'lucide-react'
import { useFinance } from "@/contexts/FinanceContext"
import toast from "react-hot-toast"

export default function BudgetPage() {
  const { budgets, addBudget, currency } = useFinance()
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")

  const handleAddBudget = async () => {
    if (newCategory && newAmount) {
      const newBudget = {
        category: newCategory,
        budgeted: parseFloat(newAmount),
        spent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      // Persist to the database
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget),
      });
  
      if (response.ok) {
        const savedBudget = await response.json();
        addBudget(savedBudget); // Update local state with saved budget
        toast.success("Budget added successfully!");
        setNewCategory("");
        setNewAmount("");
      } else {
        toast.error("Failed to add budget.");
      }
    }
  };
  
  useEffect(() => {
    budgets.forEach((budget) => {
      if (budget.spent > budget.budgeted) {
        toast.error(`Budget exceeded for ${budget.category}!`);
      }
    });
  }, [budgets]);
  

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monthly Budget</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add New Budget Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter budget category"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Budgeted Amount</Label>
            <Input
              id="amount"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Enter budgeted amount"
            />
          </div>
          <Button onClick={handleAddBudget}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Budget
          </Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle>{budget.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
              <Progress
                    value={(budget.spent / budget.budgeted) * 100}
                    className={
                      budget.spent / budget.budgeted >= 1
                        ? "bg-red-500" // Over budget
                        : budget.spent / budget.budgeted >= 0.75
                        ? "bg-yellow-500" // Approaching budget
                        : "bg-green-500" // Under budget
                    }
                  />

                <div className="flex justify-between text-sm">
                  <span>Spent: {currency} {budget.spent.toFixed(2)}</span>
                  <span>Budgeted: {currency} {budget.budgeted.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


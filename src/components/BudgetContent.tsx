'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from 'lucide-react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Budget } from "@/types/index"

export default function BudgetContent() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchBudgets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/budgets')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      console.error("Error fetching budgets:", error)
      toast.error("Failed to fetch budgets")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  useEffect(() => {
    budgets.forEach((budget) => {
      if (budget.spent >= budget.budgeted) {
        toast.error(`Budget exceeded for ${budget.category}!`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
    });
  }, [budgets]);

  const handleAddBudget = async () => {
    if (newCategory && newAmount) {
      const newBudget = {
        category: newCategory,
        budgeted: parseFloat(newAmount),
        spent: 0,
      };

      try {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBudget),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const savedBudget = await response.json();
        setBudgets([...budgets, savedBudget]);
        toast.success('Budget added successfully!', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        setNewCategory("");
        setNewAmount("");
      } catch (error) {
        console.error("Error adding budget:", error)
        toast.error("Failed to add budget.");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {budgets.map((budget: Budget) => (
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
                      ? "bg-red-500" 
                      : budget.spent / budget.budgeted >= 0.75
                      ? "bg-yellow-500" 
                      : "bg-green-500" 
                  }
                />
                <div className="flex justify-between text-sm">
                  <span>Spent: ${budget.spent.toFixed(2)}</span>
                  <span>Budgeted: ${budget.budgeted.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </>
  )
}


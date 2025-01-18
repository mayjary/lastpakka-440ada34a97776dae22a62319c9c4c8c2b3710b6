"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { getLoggedInUser } from "@/lib/actions/user.actions"

interface Transaction {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
}

interface ChartData {
  name: string;
  total: number;
}

const SpendingReportCard = () => {
  const [isMounted, setIsMounted] = useState(false)
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const user = await getLoggedInUser()
      if (user?.email) {
        try {
          const response = await fetch(`/api/transactions?email=${user.email}`)
          if (response.ok) {
            const transactions: Transaction[] = await response.json()
            const processedData = processTransactions(transactions)
            setData(processedData)
          } else {
            console.error('Error fetching data:', response.statusText)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    }
    fetchData()
  }, [])

  const processTransactions = (transactions: Transaction[]): ChartData[] => {
    const categoryTotals: { [key: string]: number } = {}
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (!categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] = 0
        }
        categoryTotals[transaction.category] += transaction.amount
      }
    })
    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        name: category,
        total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4) // Show only top 4 categories
  }

  const getBarColor = (index: number) => {
    return index % 2 === 0 ? "#ef4444" : "#1e40af" // Alternating red and navy blue
  }

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Report by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Report</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={true}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={true}
              tickFormatter={(value) => `$${value}`}
            />
            <Bar 
              dataKey="total" 
              radius={[0, 0, 0, 0]} 
              maxBarSize={60} 
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default SpendingReportCard


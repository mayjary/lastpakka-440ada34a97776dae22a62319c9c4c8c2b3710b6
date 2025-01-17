"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { getLoggedInUser } from "@/lib/actions/user.actions"

interface Transaction {
  date: string;
  type: 'income' | 'expense';
  amount: number;
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
        const response = await fetch(`/api/transactions?email=${user.email}`)
        if (response.ok) {
          const transactions: Transaction[] = await response.json()
          const processedData = processTransactions(transactions)
          setData(processedData)
        }
      }
    }
    fetchData()
  }, [])

  const processTransactions = (transactions: Transaction[]): ChartData[] => {
    const monthlyTotals: { [key: string]: number } = {}
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = 0
      }
      if (transaction.type === 'expense') {
        monthlyTotals[monthYear] += transaction.amount
      }
    })
    return Object.entries(monthlyTotals)
      .map(([date, total]) => ({
        name: new Date(date).toLocaleString('default', { month: 'short' }),
        total
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-6)
  }

  const getBarColor = (total: number) => {
    return total > 2000 ? "#ef4444" : "#22c55e"
  }

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Report</CardTitle>
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
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.total)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default SpendingReportCard


/* eslint-disable */

"use client"

import { useEffect, useState } from "react"
import BalanceCard from "@/components/dashboard/balance-card"
import IncomeExpenseCard from "@/components/dashboard/income-expense-card"
import SpendingReportCard from "@/components/dashboard/spending-report-card"
import RecentTransactionsCard from "@/components/dashboard/recent-transactions-card"
import { getLoggedInUser } from "@/lib/actions/user.actions"
import { Skeleton } from "@/components/ui/skeleton"
import Chatbot from "@/components/Chatbot"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await getLoggedInUser() 
      setUser(loggedInUser) 
    }
    fetchUser() 
  }, [])

  if (!user) {
    return <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
            </div>
  </div> 
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard />
        <IncomeExpenseCard/>
        
      </div>
      <SpendingReportCard />
      <RecentTransactionsCard/>
      
        <Chatbot/>

      
    </div>
  )
}

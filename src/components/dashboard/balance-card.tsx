/* eslint-disable */


"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Skeleton } from "../ui/skeleton";

const BalanceCard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/balance');
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const result = await response.json();
      setBalance(result.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      // toast.error("Failed to load balance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div><Skeleton className="w-[100px] h-[20px] rounded-full" /></div>
        ) : (
          <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;


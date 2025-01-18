import { Budget } from "@/types/index";

export const fetchBudgets = async (): Promise<Budget[]> => {
  const response = await fetch('/api/budgets');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateBudget = async (budget: Budget): Promise<Budget> => {
  const response = await fetch('/api/budgets', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(budget),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};


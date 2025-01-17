import { NextResponse } from 'next/server';
import { createClient } from "@/lib/appwrite";
import { Query } from 'node-appwrite';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID: USER_COLLECTION_ID,
} = process.env;

export async function GET(request: Request) {
  const user = await getLoggedInUser();
  const email = user?.email;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  console.log("GET /api/income-expense called for email:", email);
  try {
    const { databases } = await createClient();
    console.log("Appwrite client created successfully");

    if (!DATABASE_ID || !USER_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    const income = response.documents
      .filter(doc => doc.type === 'income')
      .reduce((sum, doc) => sum + (doc.amount || 0), 0);

    const expense = response.documents
      .filter(doc => doc.type === 'expense')
      .reduce((sum, doc) => sum + (doc.amount || 0), 0);

    console.log("Calculated income/expense:", { income, expense });

    return NextResponse.json({ income, expense });
  } catch (error) {
    console.error("Error fetching income/expense data:", error);
    return NextResponse.json({ error: "Failed to fetch income/expense data", details: error.message }, { status: 500 });
  }
}


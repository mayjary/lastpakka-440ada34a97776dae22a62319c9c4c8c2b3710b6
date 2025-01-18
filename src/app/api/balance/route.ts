/* eslint-disable */


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
  console.log(request)
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  console.log("GET /api/balance called for email:", email);
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

    const balance = response.documents.reduce((sum, doc) => {
      return doc.type === 'income' ? sum + (doc.amount || 0) : sum - (doc.amount || 0);
    }, 0);

    console.log("Calculated balance:", balance);

    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
  
    const errorMessage = (error as Error).message || "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch balance", details: errorMessage },
      { status: 500 }
    );
  }
}  


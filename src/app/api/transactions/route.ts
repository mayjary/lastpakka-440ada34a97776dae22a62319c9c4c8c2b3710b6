import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/appwrite";
import { Transaction } from "@/types/transaction";
import { ID, Query } from 'node-appwrite';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION_ID: USER_COLLECTION_ID,
} = process.env;

export async function GET(request: NextRequest) {
  const user = await getLoggedInUser();
  const email = user.email;
  console.log(request)
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  console.log("GET /api/transactions called for email:", email);
  try {
    console.log("Email: ",email)
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

    if (!response.documents) {
      throw new Error("No documents property in the response");
    }

    console.log("Number of documents fetched:", response.documents.length);

    const transactions: Transaction[] = response.documents.map((doc) => ({
      id: doc.$id,
      description: doc.description || "",
      amount: doc.amount || 0,
      type: doc.type || "income",
      category: doc.category || "",
      date: doc.date || "",
      email: doc.email || "",
    }));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions", details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getLoggedInUser();
  const email = user?.email;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const transaction: Transaction = await request.json();

    console.log("Received transaction:", transaction);
    console.log("Email:", email);

    if (!DATABASE_ID || !USER_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    if (!transaction.description || transaction.amount === undefined || !transaction.type || !transaction.date) {
      return NextResponse.json(
        { error: "All fields (description, amount, type, date) are required." },
        { status: 400 }
      );
    }

    const { databases } = await createClient();
    console.log("Appwrite client created successfully");

    let result;
    if (transaction.id) {
      console.log("Editing transaction with ID:", transaction.id);
      result = await databases.updateDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        transaction.id,
        {
          ...transaction,
          email: email,
        }
      );
    } else {
      console.log("Creating new transaction");
      result = await databases.createDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        ID.unique(),
        {
          ...transaction,
          email: email,
        }
      );
    }

    console.log("Transaction processed successfully:", result.$id);
    return NextResponse.json({
      message: transaction.id ? "Transaction updated successfully" : "Transaction created successfully",
      id: result.$id,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json(
      {
        error: "Failed to process transaction",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getLoggedInUser();
  const email = user?.email;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { id } = await request.json();
  console.log("DELETE /api/transactions called for email:", email);
  try {
    const { databases } = await createClient();
    console.log("Deleting transaction with ID:", id);

    if (!DATABASE_ID || !USER_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    await databases.deleteDocument(DATABASE_ID, USER_COLLECTION_ID, id);
    console.log("Transaction deleted successfully");
    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Failed to delete transaction", details: error.message }, { status: 500 });
  }
}


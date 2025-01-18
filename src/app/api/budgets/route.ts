import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/appwrite";
import { ID } from 'node-appwrite';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_APPWRITE_BUDGET_COLLECTION_ID: BUDGET_COLLECTION_ID,
} = process.env;

export async function GET(request: NextRequest) {
  console.log(request)
  try {
    const { databases } = await createClient();

    if (!DATABASE_ID || !BUDGET_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      BUDGET_COLLECTION_ID
    );

    const budgets: Budget[] = response.documents.map((doc) => ({
      id: doc.$id,
      category: doc.category,
      budgeted: doc.budgeted,
      spent: doc.spent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, budgeted } = body;

    if (!category || typeof budgeted !== 'number') {
      return NextResponse.json({ error: "Invalid category or budgeted amount" }, { status: 400 });
    }

    const { databases } = await createClient();

    if (!DATABASE_ID || !BUDGET_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    const result = await databases.createDocument(
      DATABASE_ID,
      BUDGET_COLLECTION_ID,
      ID.unique(),
      { 
        category,
        budgeted,
        spent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const { databases } = await createClient();

    if (!DATABASE_ID || !BUDGET_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    const result = await databases.updateDocument(
      DATABASE_ID,
      BUDGET_COLLECTION_ID,
      id,
      { ...updates, updatedAt: new Date().toISOString() }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const { databases } = await createClient();

    if (!DATABASE_ID || !BUDGET_COLLECTION_ID) {
      throw new Error("Database ID or Collection ID is missing");
    }

    await databases.deleteDocument(DATABASE_ID, BUDGET_COLLECTION_ID, id);

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";

export async function GET() {
  const divisions = [
    "Barishal",
    "Chattogram",
    "Dhaka",
    "Khulna",
    "Mymensingh",
    "Rajshahi",
    "Rangpur",
    "Sylhet",
    "Anywhere in Bangladesh",
  ];
  return NextResponse.json(divisions);
}

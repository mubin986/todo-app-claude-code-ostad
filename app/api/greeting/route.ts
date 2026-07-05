import { NextResponse } from "next/server";

const GREETINGS = [
  "Hello there!",
  "Hey, great to see you!",
  "Welcome aboard!",
  "Howdy, partner!",
  "Greetings, friend!",
  "Hi! Hope you're having a good day.",
  "Yo! What's up?",
  "Good to have you here.",
  "Salutations!",
  "Nice to see you again!",
];

export async function GET() {
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  return NextResponse.json({ greeting });
}

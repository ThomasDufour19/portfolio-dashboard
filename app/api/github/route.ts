import { NextResponse } from "next/server";
import { getGitHubRepos } from "@/lib/github";

export async function GET() {
  const repos = await getGitHubRepos("ThomasDufour19");
  return NextResponse.json(repos);
}

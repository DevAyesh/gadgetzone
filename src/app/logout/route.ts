import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/login?next=/admin", request.url);
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  return GET(request);
}

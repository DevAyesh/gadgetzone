import { createAdminClient } from "@/lib/supabase/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { updateCategory } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createAdminClient();
  const { data: category } = await supabase.from("categories").select("*").eq("id", params.id).single();

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
        <Link href="/admin/categories" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCategory} className="space-y-6">
            <input type="hidden" name="id" value={category.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Category Name</label>
              <input 
                id="name" name="name" required type="text"
                defaultValue={category.name}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slug">URL Slug</label>
              <input 
                id="slug" name="slug" required type="text"
                defaultValue={category.slug}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="icon">Emoji Icon</label>
              <input 
                id="icon" name="icon" required type="text" maxLength={10}
                defaultValue={category.icon || "📦"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <Button type="submit" className="w-full">Update Category</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { updateCollection } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditCollectionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createAdminClient();
  const { data: collection } = await supabase.from("collections").select("*").eq("id", params.id).single();

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
        <Link href="/admin/collections" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCollection} className="space-y-6">
            <input type="hidden" name="id" value={collection.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Collection Name</label>
              <input 
                id="name" name="name" required type="text"
                defaultValue={collection.name}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slug">URL Slug</label>
              <input 
                id="slug" name="slug" required type="text"
                defaultValue={collection.slug}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <Button type="submit" className="w-full">Update Collection</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

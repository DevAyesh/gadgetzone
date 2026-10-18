import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionRowActions } from "@/components/admin/collection-row-actions";

export default async function AdminCollectionsPage() {
  const supabase = await createAdminClient();

  const [{ data: collections }, { data: products }] = await Promise.all([
    supabase.from("collections").select("*").order("name"),
    supabase.from("products").select("collection_id"),
  ]);

  const collectionList = collections || [];
  const productList = products || [];

  return (
    <div className="space-y-8 max-w-[1200px]">
      <PageHeader
        title="Featured Collections"
        description="Curated thematic groupings (e.g. Apple Ecosystem, Flagship Audio, Workstation Gear)."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Catalog", href: "/admin/products" },
          { label: "Collections" },
        ]}
        actions={
          <Link href="/admin/collections/new" className={cn(buttonVariants(), "gap-2")}>
            <Plus className="h-4 w-4" /> Add Collection
          </Link>
        }
      />

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Collection Name</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead>Catalog Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collectionList.length > 0 ? (
              collectionList.map((col) => {
                const count = productList.filter((p) => p.collection_id === col.id).length;

                return (
                  <TableRow key={col.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-sm">{col.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{col.slug}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {count} {count === 1 ? "product" : "products"}
                    </TableCell>
                    <TableCell className="text-right">
                      <CollectionRowActions collectionId={col.id} collectionName={col.name} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                  No collections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

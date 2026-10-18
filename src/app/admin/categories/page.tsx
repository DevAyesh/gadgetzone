import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryRowActions } from "@/components/admin/category-row-actions";

export default async function AdminCategoriesPage() {
  const supabase = await createAdminClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  const categoryList = categories || [];
  const productList = products || [];

  return (
    <div className="space-y-8 max-w-[1200px]">
      <PageHeader
        title="Product Categories"
        description="Organize your shop catalog into high-level device and accessory classifications."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Catalog", href: "/admin/products" },
          { label: "Categories" },
        ]}
        actions={
          <Link href="/admin/categories/new" className={cn(buttonVariants(), "gap-2")}>
            <Plus className="h-4 w-4" /> Add Category
          </Link>
        }
      />

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[60px]">Icon</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead>Catalog Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryList.length > 0 ? (
              categoryList.map((cat) => {
                const count = productList.filter((p) => p.category_id === cat.id).length;

                return (
                  <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-2xl">{cat.icon || "📦"}</TableCell>
                    <TableCell className="font-semibold text-sm">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {count} {count === 1 ? "product" : "products"}
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryRowActions categoryId={cat.id} categoryName={cat.name} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addProduct } from "./actions";

export function AddProductDialog({ categories, collections }: { categories: any[], collections: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Add Product
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form action={async (formData) => {
          await addProduct(formData);
          setOpen(false);
        }} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Product Name</label>
              <input 
                id="name" name="name" required type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. iPhone 16 Pro"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slug">URL Slug</label>
              <input 
                id="slug" name="slug" required type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. iphone-16-pro"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="price">Price (Rs.)</label>
              <input 
                id="price" name="price" required type="number" step="0.01" min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="999.99"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="old_price">Old Price (Rs.) (Optional)</label>
              <input 
                id="old_price" name="old_price" type="number" step="0.01" min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="1099.99"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="stock">Stock Quantity</label>
              <input 
                id="stock" name="stock" required type="number" min="0" defaultValue="100"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category_id">Category</label>
              <select 
                id="category_id" name="category_id" required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="none">Select Category...</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="collection_id">Collection (Optional)</label>
              <select 
                id="collection_id" name="collection_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="none">None</option>
                {collections?.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="badge">Product Badge</label>
              <select 
                id="badge" name="badge" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="NONE">None</option>
                <option value="NEW">NEW</option>
                <option value="HOT">HOT</option>
                <option value="SALE">SALE</option>
              </select>
            </div>
            
            <div className="space-y-2 flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_popular" 
                  id="is_popular"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium">Mark as Popular Product</span>
              </label>
              <p className="text-xs text-muted-foreground ml-6">This will show the product in the Popular Products section on the homepage.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="image_url">Image URL</label>
            <input 
              id="image_url" name="image_url" type="url"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">Description</label>
            <textarea 
              id="description" name="description" rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Product description..."
            />
          </div>

          <Button type="submit" className="w-full">Save Product</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

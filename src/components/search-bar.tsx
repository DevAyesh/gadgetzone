"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-full text-foreground hover:bg-muted inline-flex items-center justify-center w-10 h-10 transition-colors">
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 top-[20%] translate-y-0">
        <form onSubmit={handleSearch} className="flex items-center p-2 border-b">
          <Search className="h-5 w-5 text-muted-foreground ml-3 mr-2" />
          <Input 
            autoFocus
            type="search" 
            placeholder="Search products..." 
            className="border-0 focus-visible:ring-0 text-base shadow-none h-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" size="sm" className="mr-2">Search</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

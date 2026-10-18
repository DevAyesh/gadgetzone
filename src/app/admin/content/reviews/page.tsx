import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, MessageSquare, CheckCircle2, Clock, Package } from "lucide-react";

interface ReviewProductImage {
  image_url: string;
  is_primary?: boolean;
}

interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  images?: ReviewProductImage[];
}

interface ReviewProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  product?: ReviewProduct | ReviewProduct[] | null;
  profile?: ReviewProfile | ReviewProfile[] | null;
}

export default async function AdminReviewsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "all";

  const supabase = await createAdminClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      is_approved,
      created_at,
      product:products(
        id,
        name,
        slug,
        images:product_images(image_url, is_primary)
      ),
      profile:profiles(
        id,
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error);
  }

  const reviewList = (reviews || []) as unknown as ReviewRow[];

  // Metrics
  const totalReviews = reviewList.length;
  const approvedCount = reviewList.filter((r) => r.is_approved).length;
  const pendingCount = reviewList.filter((r) => !r.is_approved).length;
  const avgRating =
    totalReviews > 0
      ? (
          reviewList.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews
        ).toFixed(1)
      : "5.0";

  // Filtering
  let filtered = reviewList;

  if (search) {
    filtered = filtered.filter((r: ReviewRow) => {
      const prod = Array.isArray(r.product) ? r.product[0] : r.product;
      const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
      const prodName = prod?.name?.toLowerCase() || "";
      const commentText = r.comment?.toLowerCase() || "";
      const author = `${prof?.first_name || ""} ${prof?.last_name || ""}`.toLowerCase();
      return (
        prodName.includes(search) ||
        commentText.includes(search) ||
        author.includes(search)
      );
    });
  }

  if (filter === "approved") {
    filtered = filtered.filter((r) => r.is_approved);
  } else if (filter === "pending") {
    filtered = filtered.filter((r) => !r.is_approved);
  } else if (filter.startsWith("rating_")) {
    const star = parseInt(filter.replace("rating_", ""), 10);
    filtered = filtered.filter((r) => r.rating === star);
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      <PageHeader
        title="Customer Reviews & Ratings"
        description="Moderate customer testimonials, verify authentic product feedback, and approve public store reviews."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Content", href: "/admin/content/reviews" },
          { label: "Reviews" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={totalReviews.toLocaleString()}
          icon={MessageSquare}
          description="Customer submissions"
        />
        <StatCard
          title="Approved Reviews"
          value={approvedCount.toLocaleString()}
          icon={CheckCircle2}
          description="Visible on public product pages"
          iconClassName="bg-emerald-500/15 text-emerald-500"
        />
        <StatCard
          title="Pending Moderation"
          value={pendingCount.toLocaleString()}
          icon={Clock}
          description="Awaiting administrator approval"
          iconClassName={pendingCount > 0 ? "bg-amber-500/15 text-amber-500" : undefined}
        />
        <StatCard
          title="Average Rating"
          value={`${avgRating} / 5.0`}
          icon={Star}
          description="Overall store customer sentiment"
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar
            searchPlaceholder="Search reviews by product or comment..."
            filterOptions={[
              { label: "Pending Approval", value: "pending" },
              { label: "Approved Only", value: "approved" },
              { label: "5 Stars Only", value: "rating_5" },
              { label: "4 Stars Only", value: "rating_4" },
              { label: "3 Stars Only", value: "rating_3" },
              { label: "1-2 Stars Only", value: "rating_1" },
            ]}
            filterPlaceholder="Filter by Status / Rating"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No product reviews found"
            description="When verified buyers submit star ratings and testimonials on products, they will appear here for review and moderation."
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="min-w-[280px]">Review Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((review: ReviewRow) => {
                const product = Array.isArray(review.product) ? review.product[0] : review.product;
                const profile = Array.isArray(review.profile) ? review.profile[0] : review.profile;
                const author =
                  `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
                  "Verified Buyer";

                const primaryImage =
                  product?.images?.find((img) => img.is_primary)?.image_url ||
                  product?.images?.[0]?.image_url;

                return (
                  <TableRow key={review.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5 max-w-[200px]">
                        <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={primaryImage}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs font-medium truncate">
                          {product?.name || "Product"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-foreground font-medium">
                      {author}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < (review.rating || 0)
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                        {review.comment || <span className="italic text-muted-foreground">No written comment</span>}
                      </p>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(review.created_at)}
                    </TableCell>

                    <TableCell>
                      {review.is_approved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <ReviewRowActions
                        reviewId={review.id}
                        isApproved={review.is_approved}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

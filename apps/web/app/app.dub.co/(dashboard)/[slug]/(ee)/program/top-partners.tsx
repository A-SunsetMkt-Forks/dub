import usePartners from "@/lib/swr/use-partners";
import { buttonVariants } from "@dub/ui";
import { cn, currencyFormatter, OG_AVATAR_URL } from "@dub/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export function TopPartners() {
  const { slug } = useParams();

  const { partners, loading } = usePartners();

  return (
    <div className="rounded-md border border-neutral-200">
      <div className="flex items-center justify-between border-b border-neutral-200 p-5">
        <h2 className="text-base font-semibold text-neutral-900">
          Top partners
        </h2>

        <Link
          href={`/${slug}/program/partners`}
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "flex h-7 items-center rounded-lg border px-2 text-sm",
          )}
        >
          View all
        </Link>
      </div>
      <div className="p-3">
        <div className="h-px min-h-64">
          {loading ? (
            <div className="grid grid-cols-1 gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex h-12 items-center justify-between p-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <div className="size-8 animate-pulse rounded-full bg-neutral-200" />
                    <div className="flex flex-col gap-0.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                      <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-200" />
                    </div>
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          ) : partners?.length ? (
            <div className="grid grid-cols-1 gap-1">
              {partners.slice(0, 5).map((partner) => (
                <div
                  key={partner.id}
                  className="flex h-12 items-center justify-between p-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <img
                      src={partner.image || `${OG_AVATAR_URL}${partner.name}`}
                      alt={partner.name}
                      className="size-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-neutral-800">{partner.name}</span>
                      <span className="text-neutral-500">
                        {partner.email ?? "-"}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {currencyFormatter(partner.saleAmount / 100, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-neutral-500">
              No partners found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

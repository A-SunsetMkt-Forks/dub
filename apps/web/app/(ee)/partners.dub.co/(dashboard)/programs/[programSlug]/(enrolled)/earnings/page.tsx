import { PageContentOld } from "@/ui/layout/page-content";
import { MaxWidthWrapper } from "@dub/ui";
import { EarningsCompositeChart } from "./earnings-composite-chart";
import { EarningsTablePartner } from "./earnings-table";

export default function ProgramEarning() {
  return (
    <PageContentOld title="Earnings" showControls>
      <MaxWidthWrapper className="flex flex-col gap-6">
        <EarningsCompositeChart />
        <EarningsTablePartner />
      </MaxWidthWrapper>
    </PageContentOld>
  );
}

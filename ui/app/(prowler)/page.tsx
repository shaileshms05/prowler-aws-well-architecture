import { Spacer } from "@nextui-org/react";
import { format, subDays } from "date-fns";
import { Suspense } from "react";

import { getFindings } from "@/actions/findings/findings";
import {
  getFindingsBySeverity,
  getFindingsByStatus,
  getProvidersOverview,
} from "@/actions/overview/overview";
import { FilterControls } from "@/components/filters";
import {
  FindingsBySeverityChart,
  FindingsByStatusChart,
  LinkToFindings,
  ProvidersOverview,
  SkeletonFindingsBySeverityChart,
  SkeletonFindingsByStatusChart,
  SkeletonProvidersOverview,
} from "@/components/overview";
import { ColumnNewFindingsToDate } from "@/components/overview/new-findings-table/table/column-new-findings-to-date";
import { SkeletonTableNewFindings } from "@/components/overview/new-findings-table/table/skeleton-table-new-findings";
import { ContentLayout } from "@/components/ui";
import { DataTable } from "@/components/ui/table";
import { createDict } from "@/lib/helper";
import { FindingProps, SearchParamsProps } from "@/types";

export default function Home({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const searchParamsKey = JSON.stringify(searchParams || {});
  return (
    <ContentLayout title="AWS Well Architecture Overview" icon="solar:pie-chart-2-outline">
      <FilterControls providers />

      <div className="grid grid-cols-12 gap-12 lg:gap-6">
        <div className="col-span-12 lg:col-span-4">
          <Suspense fallback={<SkeletonProvidersOverview />}>
            <SSRAWSProvidersOverview />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Suspense fallback={<SkeletonFindingsBySeverityChart />}>
            <SSRAWSFindingsBySeverity searchParams={searchParams} />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Suspense fallback={<SkeletonFindingsByStatusChart />}>
            <SSRAWSFindingsByStatus searchParams={searchParams} />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Spacer y={16} />
          <Suspense
            key={searchParamsKey}
            fallback={<SkeletonTableNewFindings />}
          >
            <SSRAWSDataNewFindingsTable />
          </Suspense>
        </div>
      </div>
    </ContentLayout>
  );
}

const SSRAWSProvidersOverview = async () => {
  const providersOverview = await getProvidersOverview({});
  
  // Filter to show only AWS providers
  const awsProvidersOverview = {
    ...providersOverview,
    data: providersOverview.data?.filter((provider: any) => 
      provider.attributes?.provider?.toLowerCase() === 'aws'
    ) || []
  };

  return (
    <>
      <h3 className="mb-4 text-sm font-bold uppercase">AWS Providers Overview</h3>
      <ProvidersOverview providersOverview={awsProvidersOverview} />
    </>
  );
};

const SSRAWSFindingsByStatus = async ({
  searchParams,
}: {
  searchParams: SearchParamsProps | undefined | null;
}) => {
  const filters = searchParams
    ? Object.fromEntries(
        Object.entries(searchParams).filter(([key]) =>
          key.startsWith("filter["),
        ),
      )
    : {};

  // Add AWS provider filter
  const awsFilters = {
    ...filters,
    "filter[provider_type__in]": "aws"
  };

  const findingsByStatus = await getFindingsByStatus({ filters: awsFilters });

  return (
    <>
      <h3 className="mb-4 text-sm font-bold uppercase">AWS Findings by Status</h3>
      <FindingsByStatusChart findingsByStatus={findingsByStatus} />
    </>
  );
};

const SSRAWSFindingsBySeverity = async ({
  searchParams,
}: {
  searchParams: SearchParamsProps | undefined | null;
}) => {
  const filters = searchParams
    ? Object.fromEntries(
        Object.entries(searchParams).filter(([key]) =>
          key.startsWith("filter["),
        ),
      )
    : {};

  // Add AWS provider filter
  const awsFilters = {
    ...filters,
    "filter[provider_type__in]": "aws"
  };

  const findingsBySeverity = await getFindingsBySeverity({ filters: awsFilters });

  return (
    <>
      <h3 className="mb-4 text-sm font-bold uppercase">AWS Findings by Severity</h3>
      <FindingsBySeverityChart findingsBySeverity={findingsBySeverity} />
    </>
  );
};

const SSRAWSDataNewFindingsTable = async () => {
  const page = 1;
  const sort = "severity,-inserted_at";

  const twoDaysAgo = format(subDays(new Date(), 2), "yyyy-MM-dd");

  const defaultFilters = {
    "filter[status__in]": "FAIL",
    "filter[delta__in]": "new",
    "filter[inserted_at__gte]": twoDaysAgo,
    "filter[provider_type__in]": "aws" // Filter for AWS only
  };

  const findingsData = await getFindings({
    query: undefined,
    page,
    sort,
    filters: defaultFilters,
  });

  // Create dictionaries for resources, scans, and providers
  const resourceDict = createDict("resources", findingsData);
  const scanDict = createDict("scans", findingsData);
  const providerDict = createDict("providers", findingsData);

  // Expand each finding with its corresponding resource, scan, and provider
  const expandedFindings = findingsData?.data
    ? findingsData.data.map((finding: FindingProps) => {
        const scan = scanDict[finding.relationships?.scan?.data?.id];
        const resource =
          resourceDict[finding.relationships?.resources?.data?.[0]?.id];
        const provider = providerDict[scan?.relationships?.provider?.data?.id];

        return {
          ...finding,
          relationships: { scan, resource, provider },
        };
      })
    : [];

  // Create the new object while maintaining the original structure
  const expandedResponse = {
    ...findingsData,
    data: expandedFindings,
  };

  return (
    <>
      <div className="relative flex w-full">
        <div className="flex w-full items-center gap-2">
          <h3 className="text-sm font-bold uppercase">
            Latest AWS Well Architecture failing findings
          </h3>
          <p className="text-xs text-gray-500">
            Showing the latest 10 new failing AWS findings by severity from the last
            2 days.
          </p>
        </div>
        <div className="absolute -top-6 right-0">
          <LinkToFindings />
        </div>
      </div>
      <Spacer y={4} />
      <DataTable
        columns={ColumnNewFindingsToDate}
        data={expandedResponse?.data || []}
        // metadata={findingsData?.meta}
      />
    </>
  );
};

import { DubApiError } from "@/lib/api/errors";
import { getProgramOrThrow } from "@/lib/api/programs/get-program-or-throw";
import { withWorkspace } from "@/lib/auth";
import { partnersCountQuerySchema } from "@/lib/zod/schemas/partners";
import { prisma } from "@dub/prisma";
import { Prisma, ProgramEnrollmentStatus } from "@dub/prisma/client";
import { NextResponse } from "next/server";

// GET /api/partners/count - get the count of partners for a program
export const GET = withWorkspace(
  async ({ workspace, searchParams }) => {
    const { programId } = searchParams;

    if (!programId) {
      throw new DubApiError({
        code: "bad_request",
        message:
          "Program ID not found. Did you forget to include a `programId` query parameter?",
      });
    }

    await getProgramOrThrow({
      workspaceId: workspace.id,
      programId,
    });

    const { groupBy, status, country, rewardId, search, ids } =
      partnersCountQuerySchema.parse(searchParams);

    const commonWhere: Prisma.PartnerWhereInput = {
      ...(search && {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      }),
      ...(ids && {
        id: { in: ids },
      }),
    };

    // Get partner count by country
    if (groupBy === "country") {
      const partners = await prisma.partner.groupBy({
        by: ["country"],
        where: {
          programs: {
            some: {
              programId,
              ...(rewardId && {
                rewards: {
                  some: {
                    rewardId,
                  },
                },
              }),
            },
            every: {
              status: status || { not: "rejected" },
            },
          },
          ...commonWhere,
        },
        _count: true,
        orderBy: {
          _count: {
            country: "desc",
          },
        },
      });

      return NextResponse.json(partners);
    }

    // Get partner count by status
    if (groupBy === "status") {
      const partners = await prisma.programEnrollment.groupBy({
        by: ["status"],
        where: {
          programId,
          ...(rewardId && {
            rewards: {
              some: {
                rewardId,
              },
            },
          }),
          partner: {
            ...(country && {
              country,
            }),
            ...commonWhere,
          },
        },
        _count: true,
      });

      // Find missing statuses
      const missingStatuses = Object.values(ProgramEnrollmentStatus).filter(
        (status) => !partners.some((p) => p.status === status),
      );

      // Add missing statuses with count 0
      missingStatuses.forEach((status) => {
        partners.push({ _count: 0, status });
      });

      return NextResponse.json(partners);
    }

    // Get partner count by reward
    if (groupBy === "rewardId") {
      const [customRewardsPartners, allRewards, defaultRewardsPartners] =
        await Promise.all([
          prisma.partnerReward.groupBy({
            by: ["rewardId"],
            where: {
              programEnrollment: {
                programId,
                status: status || { not: "rejected" },
                partner: {
                  ...(country && {
                    country,
                  }),
                  ...commonWhere,
                },
              },
            },
            _count: true,
          }),
          prisma.reward.findMany({
            where: {
              programId,
            },
          }),
          prisma.programEnrollment.count({
            where: {
              rewards: {
                none: {},
              },
            },
          }),
        ]);

      const partnersWithReward = allRewards
        .map((reward) => {
          const partnerCount = customRewardsPartners.find(
            (p) => p.rewardId === reward.id,
          )?._count;

          return {
            ...reward,
            partnersCount: partnerCount ?? defaultRewardsPartners,
          };
        })
        .sort((a, b) => b.partnersCount - a.partnersCount);

      return NextResponse.json(partnersWithReward);
    }

    // Get absolute count of partners
    const count = await prisma.programEnrollment.count({
      where: {
        programId,
        status: status || { not: "rejected" },
        ...(rewardId && {
          rewards: {
            some: {
              rewardId,
            },
          },
        }),
        partner: {
          ...(country && {
            country,
          }),
          ...commonWhere,
        },
      },
    });

    return NextResponse.json(count);
  },
  {
    requiredPlan: [
      "business",
      "business extra",
      "business max",
      "business plus",
      "enterprise",
    ],
  },
);

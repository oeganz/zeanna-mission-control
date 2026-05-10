"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useMemo } from "react";

import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import {
  Activity,
  BarChart3,
  Bot,
  LayoutDashboard,
  LayoutGrid,
  Shield,
} from "lucide-react";

import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { ApiError } from "@/api/mutator";
import {
  type listAgentsApiV1AgentsGetResponse,
  useListAgentsApiV1AgentsGet,
} from "@/api/generated/agents/agents";
import {
  type listBoardsApiV1BoardsGetResponse,
  useListBoardsApiV1BoardsGet,
} from "@/api/generated/boards/boards";
import {
  type healthzHealthzGetResponse,
  useHealthzHealthzGet,
} from "@/api/generated/healthz/healthz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const numberFormatter = new Intl.NumberFormat("en-US");

const formatCount = (value: number): string =>
  Number.isFinite(value) ? numberFormatter.format(Math.max(0, Math.round(value))) : "0";

function QuickStatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "slate";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`rounded-lg p-2 ${toneClasses[tone]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
      <div className="rounded-full bg-slate-50 p-4">
        <LayoutDashboard className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Your dashboard is ready</h2>
      <p className="mt-1 text-sm text-slate-500">
        Connect your first board to start tracking tickets
      </p>
      <Link href="/boards" className="mt-6">
        <Button>
          <LayoutGrid className="mr-2 h-4 w-4" />
          Go to Boards
        </Button>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { isSignedIn } = useAuth();

  const boardsQuery = useListBoardsApiV1BoardsGet<listBoardsApiV1BoardsGetResponse, ApiError>(
    { limit: 200 },
    {
      query: {
        enabled: Boolean(isSignedIn),
        refetchInterval: 30_000,
        refetchOnMount: "always",
      },
    },
  );

  const agentsQuery = useListAgentsApiV1AgentsGet<listAgentsApiV1AgentsGetResponse, ApiError>(
    { limit: 200 },
    {
      query: {
        enabled: Boolean(isSignedIn),
        refetchInterval: 15_000,
        refetchOnMount: "always",
      },
    },
  );

  const healthQuery = useHealthzHealthzGet<healthzHealthzGetResponse, ApiError>(undefined, {
    query: {
      enabled: Boolean(isSignedIn),
      refetchInterval: 15_000,
      refetchOnMount: "always",
    },
  });

  const boards = useMemo(
    () =>
      boardsQuery.data?.status === 200
        ? [...(boardsQuery.data.data.items ?? [])].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [boardsQuery.data],
  );

  const agents = useMemo(
    () =>
      agentsQuery.data?.status === 200
        ? [...(agentsQuery.data.data.items ?? [])].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [agentsQuery.data],
  );

  const healthStatus = healthQuery.data?.status === 200 ? "Online" : "Unknown";
  const healthTone: "blue" | "green" | "amber" | "slate" =
    healthQuery.data?.status === 200 ? "green" : "amber";

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel
          message="Sign in to access the dashboard."
          forceRedirectUrl="/onboarding"
          signUpForceRedirectUrl="/onboarding"
        />
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">Overview of your mission control</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <QuickStatCard
                title="Total Boards"
                value={formatCount(boards.length)}
                icon={<BarChart3 className="h-4 w-4" />}
                tone="blue"
              />
              <QuickStatCard
                title="Total Agents"
                value={formatCount(agents.length)}
                icon={<Bot className="h-4 w-4" />}
                tone="green"
              />
              <QuickStatCard
                title="Pending Approvals"
                value="0"
                icon={<Shield className="h-4 w-4" />}
                tone="amber"
              />
              <QuickStatCard
                title="System Status"
                value={healthStatus}
                icon={<Activity className="h-4 w-4" />}
                tone={healthTone}
              />
            </div>

            <div className="mt-6">
              <EmptyState />
            </div>
          </div>
        </main>
      </SignedIn>
    </DashboardShell>
  );
}

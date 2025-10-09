"use client"
import { Briefcase, FileCheck, TrendingUp } from "lucide-react";
import { ClaimHistoryCard, MetricCard, UserSummaryCard } from "../components/metriccard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard title="Pool Size" value="$111.81K" icon={Briefcase} />
        <MetricCard title="Active Policies" value="$111.81K" icon={FileCheck} />
        <MetricCard title="Surplus Distributed" value="$111.81K" icon={TrendingUp} />
      </div>

      <ClaimHistoryCard />

      <UserSummaryCard />
    </div>
  );
}
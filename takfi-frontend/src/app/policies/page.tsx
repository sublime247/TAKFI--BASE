"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SquarePen } from "lucide-react"
import { CreatePolicyModal } from "../components/create_policy_modal"
import { PolicyCard } from "../components/policy_card"

// Mock data - you can replace this with your actual data source
const individualPolicies = [
  {
    id: "329768",
    title: "Car Insurance",
    amount: 15000,
    ethAmount: 0.05,
    status: "Active" as const,
    claimStatus: "None" as const,
    contributionProgress: 25,
  },
  {
    id: "329768",
    title: "Land",
    amount: 5000,
    ethAmount: 0.02,
    status: "Pending" as const,
    claimStatus: "None" as const,
    contributionProgress: 25,
  },
  {
    id: "329768",
    title: "Building",
    amount: 7000,
    ethAmount: 0.03,
    status: "Expired" as const,
    claimStatus: "None" as const,
    contributionProgress: 25,
  },
]

const groupPolicies = [
  {
    id: "329768",
    title: "Car Insurance",
    amount: 15000,
    ethAmount: 0.05,
    status: "Active" as const,
    claimStatus: "None" as const,
    contributionProgress: 25,
    isGroup: true,
    groupSize: 9,
    contributorsCount: 3,
    surplusEligibility: false,
  },
  {
    id: "329768",
    title: "Health",
    amount: 73000,
    ethAmount: 0.25,
    status: "Pending" as const,
    claimStatus: "None" as const,
    contributionProgress: 25,
    isGroup: true,
    groupSize: 9,
    contributorsCount: 3,
    surplusEligibility: true,
  },
  {
    id: "329768",
    title: "Fire Insurance",
    amount: 85000,
    ethAmount: 0.30,
    status: "Active" as const,
    claimStatus: "None" as const,
    contributionProgress: 25,
    isGroup: true,
    groupSize: 9,
    contributorsCount: 3,
    surplusEligibility: false,
  },
]

export default function DashboardPage() {
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  return (
    <main className="flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold text-foreground">Active Policies</h1>
        <Button
          className="bg-[#12D96A] hover:bg-green text-black cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => setShowSubmitModal(true)}
        >
          <SquarePen className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <div className="p-6 space-y-8">
        {/* Individual Policies */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">My Policies (Individual)</h2>
            <Button variant="link" className="text-primary hover:text-primary/80">
              view all
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualPolicies.map((policy, index) => (
              <PolicyCard
                key={`individual-${index}`}
                id={policy.id}
                title={policy.title}
                amount={policy.amount}
                ethAmount={policy.ethAmount}
                status={policy.status}
                claimStatus={policy.claimStatus}
                contributionProgress={policy.contributionProgress}
              />
            ))}
          </div>
        </section>

        {/* Group Policies */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">My Policies (Group)</h2>
            <Button variant="link" className="text-primary hover:text-primary/80">
              view all
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupPolicies.map((policy, index) => (
              <PolicyCard
                key={`group-${index}`}
                id={policy.id}
                title={policy.title}
                amount={policy.amount}
                ethAmount={policy.ethAmount}
                status={policy.status}
                claimStatus={policy.claimStatus}
                contributionProgress={policy.contributionProgress}
                isGroup={policy.isGroup}
                groupSize={policy.groupSize}
                contributorsCount={policy.contributorsCount}
                surplusEligibility={policy.surplusEligibility}
              />
            ))}
          </div>
        </section>
      </div>

      <CreatePolicyModal open={showSubmitModal} onOpenChange={setShowSubmitModal} />
    </main>
  )
}
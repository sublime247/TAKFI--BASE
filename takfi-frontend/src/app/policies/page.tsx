"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SquarePen } from "lucide-react"
import { CreatePolicyModal } from "../components/create_policy_modal"
import { PolicyCard } from "../components/policy_card"
import { useAccount, useReadContract } from "wagmi"
import { TAKFI_CONTRACT_ADDRESS } from "../contracts/takfi-address"
import { TAKFI_ABI } from "../contracts/takfi-abi"
import { formatEther } from "viem"

// Interface for policy data from blockchain
interface BlockchainPolicy {
  id: string
  title: string
  amount: number
  ethAmount: number
  status: "Active" | "Pending" | "Expired"
  claimStatus: "None" | "Processing" | "Approved" | "Rejected"
  contributionProgress: number
  isGroup?: boolean
  groupSize?: number
  contributorsCount?: number
  surplusEligibility?: boolean
}

// Asset type mapping for display
const getAssetTypeFromCoverage = (coverage: bigint): string => {
  const coverageInEth = Number(formatEther(coverage))

  // Simple heuristic based on coverage amount
  // You might want to store this in the contract or use a better method
  if (coverageInEth < 1) return "Land"
  if (coverageInEth < 5) return "Car Insurance"
  if (coverageInEth < 10) return "Building"
  return "Health"
}

// Calculate contribution progress (simplified - based on current vs total needed)
const calculateProgress = (totalContributions: bigint, coverageAmount: bigint): number => {
  if (coverageAmount === BigInt(0)) return 0
  const progress = (Number(totalContributions) / Number(coverageAmount)) * 100
  return Math.min(Math.round(progress), 100)
}

export default function DashboardPage() {
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [individualPolicies, setIndividualPolicies] = useState<BlockchainPolicy[]>([])
  const [groupPolicies, setGroupPolicies] = useState<BlockchainPolicy[]>([])
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true)

  const { address, isConnected } = useAccount()

  // Get user's policy IDs
  const { data: policyIds, isLoading: isLoadingIds, refetch: refetchPolicyIds } = useReadContract({
    address: TAKFI_CONTRACT_ADDRESS,
    abi: TAKFI_ABI,
    functionName: "getUserPolicies",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Fetch policy details for each policy ID using wagmi's readContracts
  useEffect(() => {
    const fetchPolicyDetails = async () => {
      if (!policyIds || !Array.isArray(policyIds) || policyIds.length === 0) {
        setIndividualPolicies([])
        setGroupPolicies([])
        setIsLoadingPolicies(false)
        return
      }

      try {
        setIsLoadingPolicies(true)
        const individual: BlockchainPolicy[] = []
        const group: BlockchainPolicy[] = []

        // Use wagmi's client to fetch details for each policy
        const { readContract } = await import('wagmi/actions')
        const { config } = await import('@/wagmi')

        // Fetch details for each policy
        for (const policyId of policyIds) {
          try {
            const policyIdNum = typeof policyId === 'bigint' ? policyId : BigInt(policyId)

            // Fetch policy details from contract
            const policyDetails = await readContract(config, {
              address: TAKFI_CONTRACT_ADDRESS,
              abi: TAKFI_ABI,
              functionName: 'getPolicyDetails',
              args: [policyIdNum],
            }) as [number, string, bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint]

            // Destructure the returned values
            const [
              policyType,
              ,
              coverageAmount,
              contributionPerMember,
              ,
              endDate,
              isActive,
              totalContributions,
              ,
              memberCount,
            ] = policyDetails

            // Determine status based on isActive and endDate
            let status: "Active" | "Pending" | "Expired" = "Active"
            const now = Math.floor(Date.now() / 1000)
            const endDateNum = Number(endDate)

            if (!isActive) {
              status = "Expired"
            } else if (endDateNum < now) {
              status = "Expired"
            }

            // Calculate contribution progress
            const progress = calculateProgress(totalContributions, coverageAmount)

            // Convert values
            const ethAmount = Number(formatEther(contributionPerMember))
            const amountInUsd = ethAmount * 3000 // Rough conversion

            const policy: BlockchainPolicy = {
              id: policyIdNum.toString(),
              title: getAssetTypeFromCoverage(coverageAmount),
              amount: Math.round(amountInUsd),
              ethAmount: ethAmount,
              status: status,
              claimStatus: "None", // You'd need to check claims separately
              contributionProgress: progress,
            }

            // Separate individual and group policies
            if (policyType === 0) {
              // INDIVIDUAL
              individual.push(policy)
            } else {
              // GROUP
              const memberCountNum = Number(memberCount)
              group.push({
                ...policy,
                isGroup: true,
                groupSize: memberCountNum,
                contributorsCount: memberCountNum,
                surplusEligibility: progress >= 100, // Simplified logic
              })
            }
          } catch (error) {
            console.error(`Error fetching policy ${policyId}:`, error)
          }
        }

        setIndividualPolicies(individual)
        setGroupPolicies(group)
      } catch (error) {
        console.error("Error fetching policy details:", error)
      } finally {
        setIsLoadingPolicies(false)
      }
    }

    fetchPolicyDetails()
  }, [policyIds])

  // Refetch policies when modal closes (after creating new policy)
  useEffect(() => {
    if (!showSubmitModal && isConnected) {
      refetchPolicyIds()
    }
  }, [showSubmitModal, isConnected, refetchPolicyIds])

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
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Please connect your wallet to view your policies</p>
          </div>
        ) : isLoadingIds || isLoadingPolicies ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading policies...</p>
          </div>
        ) : !policyIds || (Array.isArray(policyIds) && policyIds.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No policies found. Create your first policy!</p>
          </div>
        ) : (
          <>
            {/* Individual Policies */}
            {individualPolicies.length > 0 && (
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
                      key={`individual-${policy.id}-${index}`}
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
            )}

            {/* Group Policies */}
            {groupPolicies.length > 0 && (
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
                      key={`group-${policy.id}-${index}`}
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
            )}
          </>
        )}
      </div>

      <CreatePolicyModal open={showSubmitModal} onOpenChange={setShowSubmitModal} />
    </main>
  )
}
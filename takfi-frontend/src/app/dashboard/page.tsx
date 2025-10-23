"use client"
import { Briefcase, FileCheck, TrendingUp } from "lucide-react";
import { ClaimHistoryCard, MetricCard, UserSummaryCard } from "../components/metriccard";
import { useAccount, useReadContract } from "wagmi"
import { TAKFI_CONTRACT_ADDRESS } from "../contracts/takfi-address"
import { TAKFI_ABI } from "../contracts/takfi-abi"
import { useState, useEffect } from "react"
import { formatEther } from "viem"

interface BlockchainClaim {
  claimId: string
  policyId: string
  claimant: string
  claimAmount: string
  amountInUsd: number
  reason: string
  evidenceHash: string
  status: number
  submissionDate: string
  asset: string
}

export default function Dashboard() {
  const [claims, setClaims] = useState<BlockchainClaim[]>([])
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const { address, isConnected } = useAccount()

  // Get user's claim IDs for the dashboard
  const { data: claimIds } = useReadContract({
    address: TAKFI_CONTRACT_ADDRESS,
    abi: TAKFI_ABI,
    functionName: "getUserClaims",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Fetch claim details (same logic as claims page but limited to recent claims)
  useEffect(() => {
    const fetchClaimDetails = async () => {
      if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
        setClaims([])
        setIsLoadingClaims(false)
        return
      }

      try {
        setIsLoadingClaims(true)
        const { readContract } = await import('wagmi/actions')
        const { config } = await import('@/wagmi')

        const fetchedClaims: BlockchainClaim[] = []

        // Only fetch the last 3 claims for dashboard
        const recentClaimIds = claimIds.slice(-3)

        for (const claimId of recentClaimIds) {
          try {
            const claimIdNum = typeof claimId === 'bigint' ? claimId : BigInt(claimId)

            const claimDetails = await readContract(config, {
              address: TAKFI_CONTRACT_ADDRESS,
              abi: TAKFI_ABI,
              functionName: 'getClaimDetails',
              args: [claimIdNum],
            }) as [bigint, string, bigint, string, string, number, bigint, bigint, string, string]

            const [
              policyId, claimant, claimAmount, reason, evidenceHash,
              status, submissionDate
            ] = claimDetails

            const amountInEth = Number(formatEther(claimAmount))
            const amountInUsd = amountInEth * 3000

            const getAssetFromReason = (reason: string): string => {
              const lowerReason = reason.toLowerCase()
              if (lowerReason.includes('car') || lowerReason.includes('motor')) return 'Car'
              if (lowerReason.includes('land')) return 'Land'
              if (lowerReason.includes('building')) return 'Building'
              if (lowerReason.includes('health')) return 'Health'
              return 'Other'
            }

            const formatDate = (timestamp: bigint): string => {
              const date = new Date(Number(timestamp) * 1000)
              return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            }

            fetchedClaims.push({
              claimId: claimIdNum.toString(),
              policyId: policyId.toString(),
              claimant,
              claimAmount: formatEther(claimAmount),
              amountInUsd,
              reason,
              evidenceHash,
              status,
              submissionDate: formatDate(submissionDate),
              asset: getAssetFromReason(reason),
            })
          } catch (error) {
            console.error(`Error fetching claim ${claimId}:`, error)
          }
        }

        setClaims(fetchedClaims)
      } catch (error) {
        console.error("Error fetching claim details:", error)
      } finally {
        setIsLoadingClaims(false)
      }
    }

    fetchClaimDetails()
  }, [claimIds])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard title="Pool Size" value="$111.81K" icon={Briefcase} />
        <MetricCard title="Active Policies" value="$111.81K" icon={FileCheck} />
        <MetricCard title="Surplus Distributed" value="$111.81K" icon={TrendingUp} />
      </div>

      <ClaimHistoryCard claims={claims} isLoading={isLoadingClaims} />

      <UserSummaryCard />
    </div>
  );
}
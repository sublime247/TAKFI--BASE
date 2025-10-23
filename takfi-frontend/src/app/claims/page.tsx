"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyPlus, BookDown, Hourglass, BadgeCheck, XCircle, ArrowRight } from "lucide-react"
import { ClaimHistoryCard } from "../components/metriccard"
import { SubmitClaimModal } from "../components/submit_claim_modal"
import { useAccount, useReadContract } from "wagmi"
import { TAKFI_CONTRACT_ADDRESS } from "../contracts/takfi-address"
import { TAKFI_ABI } from "../contracts/takfi-abi"
import { formatEther } from "viem"

interface BlockchainClaim {
  claimId: string
  policyId: string
  claimant: string
  claimAmount: string
  amountInUsd: number
  reason: string
  evidenceHash: string
  status: number // 0: SUBMITTED, 1: UNDER_REVIEW, 2: APPROVED, 3: REJECTED, 4: PAID
  submissionDate: string
  asset: string
}

export default function ClaimsPage() {
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [claims, setClaims] = useState<BlockchainClaim[]>([])
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [stats, setStats] = useState({
    totalPayout: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    declinedClaims: 0,
  })

  const { address, isConnected } = useAccount()

  // Get user's claim IDs
  const { data: claimIds, isLoading: isLoadingIds, refetch: refetchClaims } = useReadContract({
    address: TAKFI_CONTRACT_ADDRESS,
    abi: TAKFI_ABI,
    functionName: "getUserClaims",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Fetch claim details for each claim ID
  useEffect(() => {
    const fetchClaimDetails = async () => {
      if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
        setClaims([])
        setIsLoadingClaims(false)
        setStats({
          totalPayout: 0,
          pendingClaims: 0,
          approvedClaims: 0,
          declinedClaims: 0,
        })
        return
      }

      try {
        setIsLoadingClaims(true)
        const { readContract } = await import('wagmi/actions')
        const { config } = await import('@/wagmi')

        const fetchedClaims: BlockchainClaim[] = []
        let totalPayout = 0
        let pendingCount = 0
        let approvedCount = 0
        let declinedCount = 0

        for (const claimId of claimIds) {
          try {
            const claimIdNum = typeof claimId === 'bigint' ? claimId : BigInt(claimId)

            // Fetch claim details from contract
            const claimDetails = await readContract(config, {
              address: TAKFI_CONTRACT_ADDRESS,
              abi: TAKFI_ABI,
              functionName: 'getClaimDetails',
              args: [claimIdNum],
            }) as [bigint, string, bigint, string, string, number, bigint, bigint, string, string]

            const [
              policyId,
              claimant,
              claimAmount,
              reason,
              evidenceHash,
              status,
              submissionDate,
            ] = claimDetails

            // Convert amounts
            const amountInEth = Number(formatEther(claimAmount))
            const amountInUsd = amountInEth * 3000 // Rough conversion

            // Extract asset type from reason
            const getAssetFromReason = (reason: string): string => {
              const lowerReason = reason.toLowerCase()
              if (lowerReason.includes('car') || lowerReason.includes('motor') || lowerReason.includes('vehicle')) return 'Car'
              if (lowerReason.includes('land') || lowerReason.includes('property')) return 'Land'
              if (lowerReason.includes('building') || lowerReason.includes('house')) return 'Building'
              if (lowerReason.includes('health') || lowerReason.includes('medical')) return 'Health'
              return 'Other'
            }

            // Format date
            const formatDate = (timestamp: bigint): string => {
              const date = new Date(Number(timestamp) * 1000)
              return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            }

            const claim: BlockchainClaim = {
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
            }

            fetchedClaims.push(claim)

            // Calculate statistics
            if (status === 0 || status === 1) { // SUBMITTED or UNDER_REVIEW
              pendingCount++
            } else if (status === 2 || status === 4) { // APPROVED or PAID
              approvedCount++
              if (status === 4) {
                totalPayout += amountInUsd
              }
            } else if (status === 3) { // REJECTED
              declinedCount++
            }
          } catch (error) {
            console.error(`Error fetching claim ${claimId}:`, error)
          }
        }

        setClaims(fetchedClaims)
        setStats({
          totalPayout,
          pendingClaims: pendingCount,
          approvedClaims: approvedCount,
          declinedClaims: declinedCount,
        })
      } catch (error) {
        console.error("Error fetching claim details:", error)
      } finally {
        setIsLoadingClaims(false)
      }
    }

    fetchClaimDetails()
  }, [claimIds])

  // Refetch claims when modal closes (after submitting new claim)
  useEffect(() => {
    if (!showSubmitModal && isConnected) {
      refetchClaims()
    }
  }, [showSubmitModal, isConnected, refetchClaims])

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  return (
    <main className="flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold text-foreground">Claims</h1>
        <Button
          className="bg-[#12D96A] hover:bg-[#12D96A] text-primary-foreground cursor-pointer"
          onClick={() => setShowSubmitModal(true)}
        >
          <CopyPlus className="h-4 w-4 mr-2" />
          Submit a Claim
        </Button>
      </div>

      <div className="p-6 space-y-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Please connect your wallet to view your claims</p>
          </div>
        ) : isLoadingIds || isLoadingClaims ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading claims...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#12D96A] border-[#12D96A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BookDown className="h-5 w-5 text-primary-foreground" />
                    <CardTitle className="text-sm font-medium text-primary-foreground">Total Payout</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(stats.totalPayout)}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1E2722] border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Hourglass className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-card-foreground">Pending Claims</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-card-foreground">{stats.pendingClaims}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#12D96A] border-[#12D96A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-primary-foreground" />
                    <CardTitle className="text-sm font-medium text-primary-foreground">Approved Claims</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary-foreground">{stats.approvedClaims}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1E2722] border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-card-foreground">Declined Claims</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-card-foreground">{stats.declinedClaims}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Submit Claims CTA */}
        <Card className="bg-[#1E2722] border-[#1E2722] w-fit max-w-full relative overflow-hidden pr-40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Submit Claims in few <br /> clicks with <span className="text-[#12D96A]">TakFi</span>
                </h3>
                <Button
                  className="bg-[#12D96A] hover:bg-[#12D96A] text-primary-foreground cursor-pointer"
                  onClick={() => setShowSubmitModal(true)}
                >
                  Submit a Claim
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="absolute top-0 right-0 pointer-events-none">
                <img
                  src="./takfi-bg.png"
                  alt=""
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims History */}
        {isConnected && (
          <section>
            <ClaimHistoryCard claims={claims} isLoading={isLoadingClaims} />
          </section>
        )}
      </div>
      <SubmitClaimModal open={showSubmitModal} onOpenChange={setShowSubmitModal} />
    </main>
  )
}

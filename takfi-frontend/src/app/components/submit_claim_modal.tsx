"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle } from "lucide-react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { TAKFI_CONTRACT_ADDRESS } from "../contracts/takfi-address"
import { TAKFI_ABI } from "../contracts/takfi-abi"
import { parseEther } from "viem"
import { toast } from "sonner"

interface SubmitClaimModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserPolicy {
  id: string
  title: string
  isActive: boolean
}

export function SubmitClaimModal({ open, onOpenChange }: SubmitClaimModalProps) {
  const [formData, setFormData] = useState({
    policyId: "",
    claimType: "",
    estimatedCost: "",
    dateOfIncident: "",
    locationOfIncident: "",
    description: "",
    evidenceHash: "", // IPFS hash or document identifier
  })
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { address, isConnected } = useAccount()
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash })

  // Get user's policy IDs
  const { data: policyIds, isLoading: isLoadingPolicies } = useReadContract({
    address: TAKFI_CONTRACT_ADDRESS,
    abi: TAKFI_ABI,
    functionName: "getUserPolicies",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && open,
    },
  })

  // Fetch policy details when policyIds change
  useEffect(() => {
    const fetchPolicyDetails = async () => {
      if (!policyIds || !Array.isArray(policyIds) || policyIds.length === 0) {
        setUserPolicies([])
        return
      }

      try {
        const { readContract } = await import('wagmi/actions')
        const { config } = await import('@/wagmi')

        const policies: UserPolicy[] = []

        for (const policyId of policyIds) {
          try {
            const policyIdNum = typeof policyId === 'bigint' ? policyId : BigInt(policyId)

            const policyDetails = await readContract(config, {
              address: TAKFI_CONTRACT_ADDRESS,
              abi: TAKFI_ABI,
              functionName: 'getPolicyDetails',
              args: [policyIdNum],
            }) as [number, string, bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint]

            const [, , coverageAmount, , , , isActive] = policyDetails

            // Determine asset type from coverage
            const getAssetType = (coverage: bigint): string => {
              const coverageInEth = Number(coverage) / 1e18
              if (coverageInEth < 1) return "Land"
              if (coverageInEth < 5) return "Car"
              if (coverageInEth < 10) return "Building"
              return "Health"
            }

            if (isActive) {
              policies.push({
                id: policyIdNum.toString(),
                title: `${getAssetType(coverageAmount)} - Policy #${policyIdNum}`,
                isActive,
              })
            }
          } catch (error) {
            console.error(`Error fetching policy ${policyId}:`, error)
          }
        }

        setUserPolicies(policies)
      } catch (error) {
        console.error("Error fetching policy details:", error)
      }
    }

    fetchPolicyDetails()
  }, [policyIds])

  // Watch for transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Claim submitted successfully!", {
        description: "Your claim has been submitted and is pending review.",
        duration: 5000,
      })
      setIsSubmitted(true)
    }
  }, [isConfirmed])

  // Watch for errors
  useEffect(() => {
    if (writeError) {
      toast.error("Failed to submit claim", {
        description: writeError.message || "An error occurred while submitting the claim.",
        duration: 5000,
      })
    }
  }, [writeError])

  useEffect(() => {
    if (confirmError) {
      toast.error("Transaction failed", {
        description: confirmError.message || "The transaction failed to confirm.",
        duration: 5000,
      })
    }
  }, [confirmError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet first.",
        duration: 5000,
      })
      return
    }

    if (!formData.policyId || !formData.estimatedCost || !formData.description) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields.",
        duration: 5000,
      })
      return
    }

    try {
      // Parse claim amount
      const claimAmountInUsd = parseFloat(formData.estimatedCost.replace(/[^0-9.]/g, ""))
      const claimAmountInEth = claimAmountInUsd / 3000 // Rough USD to ETH conversion
      const claimAmount = parseEther(claimAmountInEth.toString())

      // Build reason string with all details
      const reason = `${formData.claimType || "Claim"} - ${formData.description}. Incident Date: ${formData.dateOfIncident || "N/A"}, Location: ${formData.locationOfIncident || "N/A"}`

      // Submit claim to blockchain
      writeContract({
        address: TAKFI_CONTRACT_ADDRESS,
        abi: TAKFI_ABI,
        functionName: "submitClaim",
        args: [
          BigInt(formData.policyId),
          claimAmount,
          reason,
          formData.evidenceHash || "ipfs://placeholder-hash", // You'd upload to IPFS first
        ],
      })
    } catch (error) {
      console.error("Error submitting claim:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to submit claim",
        duration: 5000,
      })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form after a delay
    setTimeout(() => {
      setFormData({
        policyId: "",
        claimType: "",
        estimatedCost: "",
        dateOfIncident: "",
        locationOfIncident: "",
        description: "",
        evidenceHash: "",
      })
      setIsSubmitted(false)
    }, 300)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1E2722] border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            {isSubmitted ? "Claim Submitted" : "Submit a Claim"}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="space-y-6 mt-6 text-center py-8">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Claim Submitted Successfully!</h3>
              <p className="text-muted-foreground">Your claim is now pending review by the administrators.</p>
            </div>
            {hash && (
              <div className="bg-[#12D96A]/10 border border-[#12D96A] rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
                <p className="text-xs text-[#12D96A] break-all font-mono">{hash}</p>
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#12D96A] hover:underline mt-2 inline-block"
                >
                  View on BaseScan →
                </a>
              </div>
            )}
            <Button
              onClick={handleClose}
              className="w-full bg-[#12D96A] hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please connect your wallet to submit a claim.</p>
              </div>
            ) : isLoadingPolicies ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your policies...</p>
              </div>
            ) : userPolicies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don&apos;t have any active policies. Create a policy first.</p>
              </div>
            ) : (
              <>
                {/* Policy ID */}
                <div className="space-y-2">
                  <Label htmlFor="policyId" className="text-sm font-medium text-card-foreground">
                    Select Policy <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.policyId} onValueChange={(value) => handleInputChange("policyId", value)}>
                    <SelectTrigger className="border-border text-foreground w-full">
                      <SelectValue placeholder="Select a policy" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border w-full min-w-[100%]">
                      {userPolicies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Claim Type */}
                <div className="space-y-2">
                  <Label htmlFor="claimType" className="text-sm font-medium text-card-foreground">
                    Claim Type
                  </Label>
                  <Input
                    id="claimType"
                    placeholder="e.g Car, Land, Health"
                    value={formData.claimType}
                    onChange={(e) => handleInputChange("claimType", e.target.value)}
                    className="border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Estimated Repair Cost and Date of Incident */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost" className="text-sm font-medium text-card-foreground">
                      Estimated Cost (USD) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="estimatedCost"
                      placeholder="e.g. $5000"
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange("estimatedCost", e.target.value)}
                      className="border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfIncident" className="text-sm font-medium text-card-foreground">
                      Date of Incident
                    </Label>
                    <Input
                      id="dateOfIncident"
                      type="date"
                      value={formData.dateOfIncident}
                      onChange={(e) => handleInputChange("dateOfIncident", e.target.value)}
                      className="border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Location of Incident */}
                <div className="space-y-2">
                  <Label htmlFor="locationOfIncident" className="text-sm font-medium text-card-foreground">
                    Location of Incident
                  </Label>
                  <Input
                    id="locationOfIncident"
                    placeholder="Ar-Riyadh city, Saudi"
                    value={formData.locationOfIncident}
                    onChange={(e) => handleInputChange("locationOfIncident", e.target.value)}
                    className="border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Description of Incident */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-card-foreground">
                    Description of Incident <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what happened..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Upload Evidence */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-card-foreground">Upload Evidence (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-input/50">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Upload a document as evidence</p>
                      <p className="text-xs text-muted-foreground">Coming soon: IPFS integration</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Status Messages */}
                {isPending && (
                  <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                    <p className="text-yellow-500 text-sm">Waiting for wallet confirmation...</p>
                  </div>
                )}

                {isConfirming && (
                  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                    <p className="text-blue-500 text-sm">Transaction pending... Please wait for confirmation.</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending || isConfirming}
                    className="flex-1 bg-secondary border-border text-secondary-foreground hover:bg-[red]/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || isConfirming || !formData.policyId || !formData.estimatedCost || !formData.description}
                    className="flex-1 bg-[#12D96A] hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Confirm in Wallet..." : isConfirming ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

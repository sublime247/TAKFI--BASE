"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ArrowLeft, Copy, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { parseEther } from "viem"
import { TAKFI_CONTRACT_ADDRESS } from "../contracts/takfi-address"
import { TAKFI_ABI } from "../contracts/takfi-abi"
import { toast } from "sonner"

interface CreatePolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3 | 4

interface PolicyFormData {
  policyType: string
  assetType: string
  assetValue: string
  duration: string
  description: string
  groupName: string
  purpose: string
  contributionModel: string
  inviteLink: string
}

export function CreatePolicyModal({ open, onOpenChange }: CreatePolicyModalProps) {
  const { isConnected } = useAccount()
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash })

  // We use a "virtual" step system to allow skipping group details for individual policy
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [calculatedContribution, setCalculatedContribution] = useState<string>("0")
  const [transactionError, setTransactionError] = useState<string>("")
  const [formData, setFormData] = useState<PolicyFormData>({
    policyType: "",
    assetType: "",
    assetValue: "",
    duration: "",
    description: "",
    groupName: "",
    purpose: "",
    contributionModel: "",
    inviteLink: "https://takafi-ai/invite/group_764g1",
  })

  // Watch for transaction confirmation and show toast
  useEffect(() => {
    if (isConfirmed && currentStep === 3) {
      toast.success("Policy created successfully!", {
        description: "Your policy has been created and is now active.",
        duration: 5000,
      })
      setCurrentStep(4)
    }
  }, [isConfirmed, currentStep])

  // Watch for transaction errors and show toast
  useEffect(() => {
    if (writeError) {
      toast.error("Failed to create policy", {
        description: writeError.message || "An error occurred while creating the policy.",
        duration: 5000,
      })
      setTransactionError(writeError.message || "Failed to create policy")
    }
  }, [writeError])

  // Watch for confirmation errors
  useEffect(() => {
    if (confirmError) {
      toast.error("Transaction failed", {
        description: confirmError.message || "The transaction failed to confirm.",
        duration: 5000,
      })
      setTransactionError(confirmError.message || "Transaction failed")
    }
  }, [confirmError])

  const isIndividual = formData.policyType === "individual"
  // For step navigation, we need to skip step 2 if individual
  // So, the visible steps are:
  // 1: always (policy/asset)
  // 2: group details (only for group)
  // 3: contribution preview (always)
  // 4: success (always)

  const handleInputChange = (field: keyof PolicyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Recalculate contribution when asset value or duration changes
    if (field === "assetValue" || field === "duration") {
      calculateContribution(
        field === "assetValue" ? value : formData.assetValue,
        field === "duration" ? value : formData.duration
      )
    }
  }

  // Calculate contribution based on asset value and duration
  const calculateContribution = (assetValue: string, duration: string) => {
    if (!assetValue || !duration) return

    try {
      const value = parseFloat(assetValue.replace(/[^0-9.]/g, ""))
      const durationMonths = duration === "6-months" ? 6 :
        duration === "1-year" ? 12 :
          duration === "2-years" ? 24 :
            duration === "5-years" ? 60 : 6

      // Simple calculation: 15.8% of asset value divided by duration in months
      // This is a simplified risk calculation
      const riskPercentage = 0.158
      const totalRiskAmount = value * riskPercentage
      const monthlyContribution = totalRiskAmount / durationMonths

      // Convert to ETH (assuming USD to ETH conversion, you may want to use an oracle)
      // For demo purposes, using a rough estimate: 1 ETH = $3000
      const ethContribution = monthlyContribution / 3000

      setCalculatedContribution(ethContribution.toFixed(6))
    } catch (error) {
      console.error("Error calculating contribution:", error)
      setCalculatedContribution("0")
    }
  }

  // Helper to go to next step, skipping group details if needed
  const handleNext = () => {
    if (currentStep === 1) {
      if (isIndividual) {
        setCurrentStep(3)
      } else {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Should not be called, handled by handleSubmit
    }
  }

  // Helper to go back, skipping group details if needed
  const handleBack = () => {
    if (currentStep === 3) {
      if (isIndividual) {
        setCurrentStep(1)
      } else {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet first to create a policy.",
        duration: 5000,
      })
      setTransactionError("Please connect your wallet first")
      return
    }

    try {
      setTransactionError("")

      // Parse form data
      const assetValue = parseFloat(formData.assetValue.replace(/[^0-9.]/g, ""))
      const durationInDays = formData.duration === "6-months" ? 180 :
        formData.duration === "1-year" ? 365 :
          formData.duration === "2-years" ? 730 :
            formData.duration === "5-years" ? 1825 : 180

      // Convert coverage amount to wei (asset value in USD converted to ETH)
      const coverageInEth = assetValue / 3000 // Rough USD to ETH conversion
      const coverageAmount = parseEther(coverageInEth.toString())

      // Contribution per member in wei
      const contributionPerMember = parseEther(calculatedContribution)

      // Policy type: 0 for INDIVIDUAL, 1 for GROUP
      const policyType = formData.policyType === "individual" ? 0 : 1

      // Call the smart contract
      writeContract({
        address: TAKFI_CONTRACT_ADDRESS,
        abi: TAKFI_ABI,
        functionName: "createPolicy",
        args: [
          policyType,
          coverageAmount,
          contributionPerMember,
          BigInt(durationInDays)
        ],
        value: contributionPerMember, // Send the contribution amount
      })

    } catch (error: unknown) {
      console.error("Error creating policy:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create policy"
      setTransactionError(errorMessage)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCurrentStep(1)
    setCalculatedContribution("0")
    setTransactionError("")
    setFormData({
      policyType: "",
      assetType: "",
      assetValue: "",
      duration: "",
      description: "",
      groupName: "",
      purpose: "",
      contributionModel: "",
      inviteLink: "https://takafi-ai/invite/group_764g1",
    })
  }

  const handlePolicyTypeChange = (value: string) => {
    // If switching to individual and currently on group details, jump to step 3
    setFormData((prev) => ({ ...prev, policyType: value }))
    if (value === "individual" && currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(formData.inviteLink)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Select policy type</Label>
        <Select value={formData.policyType} onValueChange={handlePolicyTypeChange}>
          <SelectTrigger className="bg-input border-border text-foreground w-full">
            <SelectValue placeholder="Individual Policy" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="individual">Individual Policy</SelectItem>
            <SelectItem value="group">Group Policy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Select asset type</Label>
        <Select value={formData.assetType} onValueChange={(value) => handleInputChange("assetType", value)}>
          <SelectTrigger className="bg-input border-border text-foreground w-full">
            <SelectValue placeholder="Car/Motor" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="car-motor">Car/Motor</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="health">Health</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Add asset value</Label>
        <Input
          placeholder="$14,045.00"
          value={formData.assetValue}
          onChange={(e) => handleInputChange("assetValue", e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Duration of Asset Holding</Label>
        <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
          <SelectTrigger className="bg-input border-border text-foreground w-full">
            <SelectValue placeholder="min. 6 months" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="6-months">min. 6 months</SelectItem>
            <SelectItem value="1-year">1 year</SelectItem>
            <SelectItem value="2-years">2 years</SelectItem>
            <SelectItem value="5-years">5 years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Asset Description</Label>
        <Textarea
          placeholder="Type something"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Upload Document</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-input/50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Upload a document of ownership</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Group name</Label>
        <Input
          placeholder="Car/Motor"
          value={formData.groupName}
          onChange={(e) => handleInputChange("groupName", e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Purpose</Label>
        <Input
          placeholder="Investment"
          value={formData.purpose}
          onChange={(e) => handleInputChange("purpose", e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Contribution Model</Label>
        <Select
          value={formData.contributionModel}
          onValueChange={(value) => handleInputChange("contributionModel", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground w-full">
            <SelectValue placeholder="Equal" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="equal">Equal</SelectItem>
            <SelectItem value="proportional">Proportional</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-card-foreground">Invite Link</Label>
        <div className="relative">
          <Input value={formData.inviteLink} readOnly className="bg-input border-border text-foreground pr-12" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyInviteLink}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted cursor-pointer"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">Your Calculated risk score</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#12D96A]"></div>
                <span className="text-muted-foreground">Low risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">High risk</span>
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            </div>

            <Progress value={25} className="h-2 bg-[#20B16C99] [&_.bg-primary]:bg-[#34C759]" />

            <p className="text-2xl font-bold text-[#12D96A]">15.8%</p>
          </div>
        </div>

        <div className="border-2 border-[#12D96A] rounded-lg p-8 bg-primary/5">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-card-foreground">{calculatedContribution} ETH</p>
            <p className="text-lg font-medium text-card-foreground">Contribution Amount</p>
            <p className="text-sm text-muted-foreground">Based on your asset value and risk score</p>
          </div>
        </div>

        {transactionError && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-500 text-sm">{transactionError}</p>
          </div>
        )}

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
      </div>
    </div>
  )
  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">Policy created successfully!</p>

          <div className="flex justify-center">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mx-auto mb-4">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
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
        </div>
      </div>
    </div>
  )

  // Dynamically get the title based on current step and policy type
  const getTitle = () => {
    if (currentStep === 1) return "Create New Policy"
    if (currentStep === 2) return "Group Details"
    if (currentStep === 3) return "Contribution Preview"
    if (currentStep === 4) return "Policy Created"
    return "Create New Policy"
  }

  // Render the correct step, skipping group details for individual
  const renderCurrentStep = () => {
    if (currentStep === 1) return renderStep1()
    if (currentStep === 2) return renderStep2()
    if (currentStep === 3) return renderStep3()
    if (currentStep === 4) return renderStep4()
    return null
  }

  // Show the Proceed button only on contribution preview
  const showProceed =
    (currentStep === 3)

  // Show the Done button only on success
  const showDone =
    (currentStep === 4)

  // Show the Cancel button for steps before contribution preview
  const showCancel =
    (currentStep === 1) ||
    (currentStep === 2 && !isIndividual)

  // Show the back button for steps after the first visible step
  const showBack =
    (currentStep === 2 && !isIndividual) ||
    (currentStep === 3) ||
    (currentStep === 4)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="p-0 h-auto hover:bg-transparent cursor-pointer">
                <ArrowLeft className="h-5 w-5 text-card-foreground" />
              </Button>
            )}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {renderCurrentStep()}
        </div>

        {showCancel && (
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-secondary border-border text-secondary-foreground hover:bg-[red]/80 cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-[#12D96A] hover:bg-primary/90 text-primary-foreground cursor-pointer">
              Continue
            </Button>
          </div>
        )}

        {showProceed && (
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isPending || isConfirming || !isConnected || !calculatedContribution || calculatedContribution === "0"}
              className="w-full bg-[#12D96A] hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Processing..." : "Proceed"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showDone && (
          <div className="pt-4">
            <Button
              onClick={() => { onOpenChange(false); setCurrentStep(1) }}
              className="w-full bg-[#12D96A] hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 cursor-pointer"
            >
              Done
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

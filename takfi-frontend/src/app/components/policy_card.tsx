import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dot } from "lucide-react"

interface PolicyCardProps {
  id: string
  title: string
  amount: number
  ethAmount: number
  status: 'Active' | 'Pending' | 'Expired'
  claimStatus: 'None' | 'Processing' | 'Approved' | 'Rejected'
  contributionProgress: number
  isGroup?: boolean
  groupSize?: number
  contributorsCount?: number
  surplusEligibility?: boolean
}

export function PolicyCard({
  id,
  title,
  amount,
  ethAmount,
  status,
  claimStatus,
  contributionProgress,
  isGroup = false,
  groupSize,
  contributorsCount,
  surplusEligibility
}: PolicyCardProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return "bg-[#12D96A30] text-[#27C840]"
      case 'Pending':
        return "bg-[#FEBC2F4D] text-[#FEBC2F]"
      case 'Expired':
        return "bg-[#FF383C4D] text-[#FF383C]"
      default:
        return "bg-[#FF383C4D] text-[#FF383C]"
    }
  }

  const getSurplusEligibilityBadge = (eligible: boolean) => {
    if (eligible) {
      return (
        <Badge className="bg-[#12D96A30] text-[#27C840]">
          <Dot style={{ fontSize: 24, width: 24, height: 32 }} />
          <span className="ml-0 text-base" style={{ marginLeft: '-10px' }}>Yes</span>
        </Badge>
      )
    }
    return (
      <Badge className="bg-[#FF383C4D] text-[#FF383C] flex items-center">
        <Dot style={{ fontSize: 24, width: 24, height: 32 }} />
        <span className="ml-0 text-base" style={{ marginLeft: '-10px' }}>No</span>
      </Badge>
    )
  }

  return (
    <Card className="bg-[#1E2722] border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge className={getStatusBadgeClass(status)}>{status}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">ID: {id}</p>
          {isGroup && groupSize && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>👥</span>
              <span>{groupSize}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Amount</p>
          <p className="text-2xl font-bold">${amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground text-right">≈ {ethAmount.toLocaleString()} ETH</p>
        </div>

        {isGroup ? (
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Claim Status</p>
              <Badge variant="destructive" className="bg-[#FF383C4D] text-[#FF383C]">{claimStatus}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Surplus Eligibility</p>
              {surplusEligibility !== undefined && getSurplusEligibilityBadge(surplusEligibility)}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Claim Status</p>
            <Badge variant="destructive" className="bg-[#FF383C4D] text-[#FF383C]">{claimStatus}</Badge>
          </div>
        )}

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Contribution Progress</span>
            <span className="text-[#34C759]">{contributionProgress}%</span>
          </div>
          <Progress value={contributionProgress} className="h-2 bg-[#20B16C99] [&_.bg-primary]:bg-[#34C759]" />
          {isGroup && contributorsCount && groupSize && (
            <p className="text-xs text-muted-foreground mt-1 text-right">{contributorsCount} of {groupSize}</p>
          )}
        </div>

        <Button
          // variant=""
          className="cursor-pointer w-full border-[#12D96A] border-1  text-primary hover:bg-[#12D96A] hover:text-primary-foreground bg-[#141A16]"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
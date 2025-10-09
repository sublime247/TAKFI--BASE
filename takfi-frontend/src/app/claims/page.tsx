"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyPlus, BookDown, Hourglass, BadgeCheck, XCircle, ArrowRight } from "lucide-react"
import { ClaimHistoryCard } from "../components/metriccard"
import { SubmitClaimModal } from "../components/submit_claim_modal"

export default function ClaimsPage() {
  const [showSubmitModal, setShowSubmitModal] = useState(false)

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
                <p className="text-3xl font-bold text-primary-foreground">$111.81K</p>
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
                <p className="text-3xl font-bold text-card-foreground">4</p>
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
                <p className="text-3xl font-bold text-primary-foreground">26</p>
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
                <p className="text-3xl font-bold text-card-foreground">0</p>
              </CardContent>
            </Card>
          </div>

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
          <section>

            <ClaimHistoryCard />
          </section>
        </div>
        <SubmitClaimModal open={showSubmitModal} onOpenChange={setShowSubmitModal} />
      </main>
  )
}

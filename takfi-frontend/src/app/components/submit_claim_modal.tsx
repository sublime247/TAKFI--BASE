"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

interface SubmitClaimModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitClaimModal({ open, onOpenChange }: SubmitClaimModalProps) {
  const [formData, setFormData] = useState({
    policyId: "",
    claimType: "",
    estimatedCost: "",
    dateOfIncident: "",
    locationOfIncident: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Claim submitted:", formData)
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1E2722] border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground">Submit a Claim</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Policy ID */}
          <div className="space-y-2">
            <Label htmlFor="policyId" className="text-sm font-medium text-card-foreground">
              Policy ID
            </Label>
            <Select value={formData.policyId} onValueChange={(value) => handleInputChange("policyId", value)}>
              <SelectTrigger className="border-border text-foreground w-full">
                <SelectValue placeholder="Car/Motor" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border w-full min-w-[100%]">
                <SelectItem value="car-motor">Car/Motor</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="fire">Fire Insurance</SelectItem>
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
                Estimated Repair Cost
              </Label>
              <Input
                id="estimatedCost"
                placeholder="min. 6 months"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange("estimatedCost", e.target.value)}
                className="border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfIncident" className="text-sm font-medium text-card-foreground">
                Date of Incident
              </Label>
              <Input
                id="dateOfIncident"
                placeholder="min. 6 months"
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
              Description of Incident
            </Label>
            <Textarea
              id="description"
              placeholder="Type something"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
            />
          </div>

          {/* Upload Evidence */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-card-foreground">Upload Evidence</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-input/50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Upload a document as an evidence</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-secondary border-border text-secondary-foreground hover:bg-[red] cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#12D96A] hover:bg-primary/90 text-primary-foreground cursor-pointer">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

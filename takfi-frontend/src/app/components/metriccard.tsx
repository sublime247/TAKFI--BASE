"use client"
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation";

interface MetricCardProps {
    title: string
    value: string
    icon: LucideIcon
}

export function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
    return (
        <Card className="bg-[#1E2722] border-gray-700/50">
            <CardContent className="p-6 pl-10">
                <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                </div>
                <div className="mt-3">
                    <span className="text-3xl font-bold text-foreground">{value}</span>
                </div>
            </CardContent>
        </Card>
    )
}

interface ClaimHistoryItem {
    claimId: string
    amountClaimed: string
    asset: string
    requestDate: string
    surplus: string
    status: 'Approved' | 'Pending' | 'Declined'
}

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

interface ClaimHistoryCardProps {
    claims?: BlockchainClaim[]
    isLoading?: boolean
}

export function ClaimHistoryCard({ claims, isLoading }: ClaimHistoryCardProps) {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    const isClaimsPage = pathname === "/claims";

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    // Convert blockchain claims to display format
    const getStatusText = (status: number): 'Approved' | 'Pending' | 'Declined' => {
        if (status === 0 || status === 1) return 'Pending' // SUBMITTED or UNDER_REVIEW
        if (status === 2 || status === 4) return 'Approved' // APPROVED or PAID
        return 'Declined' // REJECTED
    }

    const formatCurrency = (amount: number): string => {
        return `$${amount.toFixed(2)}`
    }

    const claimHistoryData: ClaimHistoryItem[] = claims ? claims.map(claim => ({
        claimId: `#${claim.claimId}`,
        amountClaimed: formatCurrency(claim.amountInUsd),
        asset: claim.asset,
        requestDate: claim.submissionDate,
        surplus: '$0.00', // Surplus distribution is handled separately in the contract
        status: getStatusText(claim.status),
    })) : []

    const filteredClaims = claimHistoryData.filter((claim) => {
        const searchLower = search.toLowerCase();
        return (
            claim.claimId.toLowerCase().includes(searchLower) ||
            claim.amountClaimed.toLowerCase().includes(searchLower) ||
            claim.asset.toLowerCase().includes(searchLower) ||
            claim.requestDate.toLowerCase().includes(searchLower) ||
            claim.surplus.toLowerCase().includes(searchLower) ||
            claim.status.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Card className="bg-[#1E2722] border-gray-700/50">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-2xl font-bold text-white">Claim History</h2>
                    <div className="flex items-center gap-12">
                        {isClaimsPage && (
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search claims"
                                className="border border-[#595959] rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#12D96A] placeholder-gray-400"
                                style={{ minWidth: 160 }}
                            />
                        )}
                        {!isClaimsPage && (
                            <button className="text-green-400 hover:text-green-300 text-sm" onClick={() => router.push("/claims")}>View all</button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Claim ID</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount Claimed</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Asset</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Request Date</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Surplus</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-6 px-4 text-center text-gray-400">Loading claims...</td>
                                </tr>
                            ) : filteredClaims.length > 0 ? (
                                filteredClaims.map((claim, index) => (
                                    <tr key={index} className="border-b border-gray-700/30">
                                        <td className="py-4 px-4 text-white">{claim.claimId}</td>
                                        <td className="py-4 px-4 text-white">{claim.amountClaimed}</td>
                                        <td className="py-4 px-4 text-white">{claim.asset}</td>
                                        <td className="py-4 px-4 text-white">{claim.requestDate}</td>
                                        <td className="py-4 px-4 text-white">{claim.surplus}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${claim.status === 'Approved' ? 'bg-green-600 text-white' :
                                                claim.status === 'Pending' ? 'bg-yellow-600 text-white' :
                                                    'bg-red-600 text-white'
                                                }`}>
                                                {claim.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-6 px-4 text-center text-gray-400">
                                        {claims === undefined ? "No claims found." : "No claims yet. Submit your first claim!"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

interface UserSummaryItem {
    assets: string
    duration: string
    policyType: string
    amountClaimed: string
    surplus: string
}

const userSummaryData: UserSummaryItem[] = [
    {
        assets: 'Land',
        duration: '6 months',
        policyType: 'Individual',
        amountClaimed: '$1,082.00',
        surplus: '$765.00'
    },
    {
        assets: 'Land',
        duration: '1 year',
        policyType: 'Individual',
        amountClaimed: '$1,082.00',
        surplus: '$765.00'
    },
    {
        assets: 'Land',
        duration: '9 months',
        policyType: 'Individual',
        amountClaimed: '$1,082.00',
        surplus: '$765.00'
    },
    {
        assets: 'Car',
        duration: '5 years',
        policyType: 'Group',
        amountClaimed: '$1,082.00',
        surplus: '$765.00'
    },
    {
        assets: 'Land',
        duration: '6 months',
        policyType: 'Individual',
        amountClaimed: '$1,082.00',
        surplus: '$765.00'
    }
]

export function UserSummaryCard() {
    return (
        <Card className="bg-[#1E2722] border-gray-700/50">
            <CardHeader className="pb-4">
                <h2 className="text-2xl font-bold text-white">User Summary</h2>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Assets</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Policy type</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount Claimed</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Surplus</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userSummaryData.map((item, index) => (
                                <tr key={index} className="border-b border-gray-700/30">
                                    <td className="py-4 px-4 text-white">{item.assets}</td>
                                    <td className="py-4 px-4 text-white">{item.duration}</td>
                                    <td className="py-4 px-4 text-white">{item.policyType}</td>
                                    <td className="py-4 px-4 text-white">{item.amountClaimed}</td>
                                    <td className="py-4 px-4 text-white">{item.surplus}</td>
                                    <td className="py-4 px-4">
                                        <button className="text-gray-400 hover:text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SettingsNav } from "@/components/settings-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ReceiptText, Zap } from "lucide-react"
import { HeaderActions } from "@/components/header-actions"

export default function BillingPage() {
    const invoices = [
        { id: "INV-2024-003", date: "June 1, 2024", amount: "$15.00", status: "Paid" },
        { id: "INV-2024-002", date: "May 1, 2024", amount: "$15.00", status: "Paid" },
        { id: "INV-2024-001", date: "April 1, 2024", amount: "$15.00", status: "Paid" },
    ];
    
    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <header className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <SidebarTrigger className="md:hidden mt-1.5" />
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Billing</h1>
                        <p className="text-muted-foreground">Manage your subscription and billing details.</p>
                    </div>
                </div>
                <HeaderActions />
            </header>

            <SettingsNav />

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>You are currently on the <span className="font-semibold text-foreground">Free</span> plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The Free plan is great for getting started. Upgrade to unlock more features.</p>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button>Upgrade to Pro</Button>
                    </CardFooter>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Pro Plan</CardTitle>
                            <CardDescription>For power users and professionals.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <div className="text-4xl font-bold font-headline mb-4">$15<span className="text-xl font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Unlimited Notes & Storage</li>
                                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Advanced AI Features</li>
                                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Priority Support</li>
                                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Advanced Sharing & Permissions</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled>Connect with Razorpay</Button>
                        </CardFooter>
                    </Card>
                     <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>The payment method used for your subscription.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No payment method on file.</p>
                        </CardContent>
                        <CardFooter>
                           <Button variant="outline" className="w-full">Add Payment Method</Button>
                        </CardFooter>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>View your past invoices and payment history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length > 0 ? invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>{invoice.date}</TableCell>
                                        <TableCell>{invoice.amount}</TableCell>
                                        <TableCell className="text-right"><Badge variant="outline">{invoice.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No billing history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter className="border-t pt-6 text-sm text-muted-foreground flex items-center gap-2">
                        <ReceiptText className="h-4 w-4" />
                        Invoices are processed by Stripe.
                     </CardFooter>
                </Card>
            </div>
        </div>
    )
}

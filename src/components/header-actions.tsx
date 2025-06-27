"use client"

import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function HeaderActions() {
    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" asChild>
                <Link href="/settings/billing">
                    <Zap className="mr-2 h-4 w-4 text-primary" />
                    Upgrade to Pro
                </Link>
            </Button>
            <UserNav />
        </div>
    )
}

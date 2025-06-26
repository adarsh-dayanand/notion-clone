
"use client"

import { Bell } from "lucide-react"

import { UserNav } from "@/components/user-nav"
import { ShareDialog } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const sharedNotes = [
    {
        id: 1,
        title: "Q4 Product Roadmap",
        sharedBy: "Olivia Martin",
        avatar: "https://placehold.co/100x100.png",
        avatarHint: "female avatar",
        fallback: "OM",
        date: "October 25, 2023",
        permission: "Can view",
    },
    {
        id: 2,
        title: "Marketing Campaign Ideas",
        sharedBy: "Jackson Lee",
        avatar: "https://placehold.co/100x100.png",
        avatarHint: "male avatar",
        fallback: "JL",
        date: "October 22, 2023",
        permission: "Can edit",
    },
    {
        id: 3,
        title: "User Research Synthesis",
        sharedBy: "Isabella Nguyen",
        avatar: "https://placehold.co/100x100.png",
        avatarHint: "female avatar",
        fallback: "IN",
        date: "October 18, 2023",
        permission: "Can comment",
    },
]

export default function SharedPage() {
  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-headline">Shared with Me</h2>
        </div>
        <div className="flex items-center gap-4">
          <ShareDialog />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    You have 3 unread messages.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="Olivia Martin" data-ai-hint="female avatar" />
                      <AvatarFallback>OM</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">Olivia Martin</span> shared a note with you.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Q4 Product Roadmap"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="Jackson Lee" data-ai-hint="male avatar" />
                      <AvatarFallback>JL</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium">
                        <span className="font-semibold">Jackson Lee</span> shared a note with you.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Marketing Campaign Ideas"
                      </p>
                        <p className="text-xs text-muted-foreground">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="William Kim" data-ai-hint="male avatar" />
                      <AvatarFallback>WK</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium">
                        <span className="font-semibold">William Kim</span> commented on your note.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Project Phoenix Kick-off"
                      </p>
                        <p className="text-xs text-muted-foreground">
                        3 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <UserNav />
        </div>
      </header>
      <main className="p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>Shared on {note.date}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                          <AvatarImage src={note.avatar} alt={note.sharedBy} data-ai-hint={note.avatarHint} />
                          <AvatarFallback>{note.fallback}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                          {note.sharedBy}
                      </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{note.permission}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}

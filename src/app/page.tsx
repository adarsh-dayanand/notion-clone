"use client"
import Link from "next/link"
import {
  FileText,
  Home,
  BrainCircuit,
  PlusCircle,
  Settings,
  Share2,
  Users,
  Bell,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarProvider,
  SidebarFooter
} from "@/components/ui/sidebar"

import { UserNav } from "@/components/user-nav"
import { NoteEditor } from "@/components/note-editor"
import { ShareDialog } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"

const notes = [
  { id: 1, title: "Project Phoenix Kick-off", icon: <FileText /> },
  { id: 2, title: "Q3 Marketing Strategy", icon: <FileText /> },
  { id: 3, title: "Engineering All-Hands", icon: <FileText /> },
  { id: 4, title: "Design System Updates", icon: <FileText /> },
]

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <BrainCircuit className="size-5 text-primary" />
            </Button>
            <h1 className="text-lg font-semibold font-headline">Memo</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive>
                <Home />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Users />
                Shared with me
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Notes</div>
          <SidebarMenu>
            {notes.map((note) => (
              <SidebarMenuItem key={note.id}>
                <SidebarMenuButton href="#">
                  {note.icon}
                  {note.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <PlusCircle />
                New Note
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Notes / Project Phoenix</p>
          </div>
          <div className="flex items-center gap-4">
            <ShareDialog />
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="p-4 md:p-8">
          <NoteEditor />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

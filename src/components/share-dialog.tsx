"use client"

import { Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ShareDialog() {
  const { toast } = useToast()

  const handleShare = () => {
    toast({
      title: "Note Shared!",
      description: "Your note has been successfully shared.",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this note. Enter their email address to share.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue="friend@example.com"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="permissions" className="text-right">
              Permissions
            </Label>
            <Select defaultValue="view">
              <SelectTrigger id="permissions" className="col-span-3">
                <SelectValue placeholder="Select permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edit">Can edit</SelectItem>
                <SelectItem value="view">Can view</SelectItem>
                <SelectItem value="comment">Can comment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleShare}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

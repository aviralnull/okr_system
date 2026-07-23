'use client'
import {Card , CardContent ,CardDescription ,CardFooter ,CardHeader ,CardTitle} from "@/components/ui/card"
import { AlertDialog, AlertDialogContent , AlertDialogDescription ,AlertDialogFooter ,AlertDialogHeader ,AlertDialogTitle ,AlertDialogTrigger ,AlertDialogCancel, AlertDialogAction } from "./ui/alert-dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
// import { Message } from "react-hook-form"
import { Message } from "@/model/User"
import { toast } from "sonner"
import axios from "axios"
import { ApiResponse } from "@/types/ApiResponse"

type MessageCardProps = {
    message : Message;
    onMessageDelete: (messageId :string)=> void

}
function MessageCard({message , onMessageDelete}: MessageCardProps) {
    const handleDeleteConfirm = async()=>{
     const response = await  axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
       toast.success(response.data.message)
       onMessageDelete(message._id.toString())
    }

  return (
   <Card>
   <CardHeader className="flex flex-row items-center justify-between">
  <CardTitle>{message.content}</CardTitle>

  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" size="icon">
        <X className="w-4 h-4" />
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your message.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDeleteConfirm}>
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</CardHeader>
    
    <CardContent>
   <p className="text-sm text-gray-500">
    {new Date(message.createdAt).toLocaleString()}
   </p>
    </CardContent>
 
   </Card>
  )
}

export default MessageCard
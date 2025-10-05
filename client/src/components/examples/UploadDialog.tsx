import { useState } from 'react'
import { UploadDialog } from '../UploadDialog'
import { Button } from '@/components/ui/button'

export default function UploadDialogExample() {
  const [open, setOpen] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>فتح نافذة الرفع</Button>
      <UploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={(file, type) => console.log('تم الرفع:', file, type)}
      />
    </div>
  )
}

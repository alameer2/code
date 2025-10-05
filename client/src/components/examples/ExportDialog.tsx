import { useState } from 'react'
import { ExportDialog } from '../ExportDialog'
import { Button } from '@/components/ui/button'

export default function ExportDialogExample() {
  const [open, setOpen] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>فتح نافذة التصدير</Button>
      <ExportDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

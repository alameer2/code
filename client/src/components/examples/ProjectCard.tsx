import { ProjectCard } from '../ProjectCard'

export default function ProjectCardExample() {
  return (
    <div className="w-96">
      <ProjectCard
        id="1"
        title="مشروع الفيديو الترويجي"
        duration="2:45"
        updatedAt="منذ ساعتين"
        status="draft"
        onOpen={(id) => console.log('فتح المشروع:', id)}
        onDelete={(id) => console.log('حذف المشروع:', id)}
        onDuplicate={(id) => console.log('نسخ المشروع:', id)}
      />
    </div>
  )
}

import { EditTaskClient } from './edit-task-client';

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string; phaseId: string; taskId: string }>;
}) {
  const { id, phaseId, taskId } = await params;
  return <EditTaskClient projectId={id} phaseId={phaseId} taskId={taskId} />;
}

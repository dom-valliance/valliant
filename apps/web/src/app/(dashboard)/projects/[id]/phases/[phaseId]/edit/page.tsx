import { EditPhaseClient } from './edit-phase-client';

export default async function EditPhasePage({
  params,
}: {
  params: Promise<{ id: string; phaseId: string }>;
}) {
  const { id, phaseId } = await params;
  return <EditPhaseClient projectId={id} phaseId={phaseId} />;
}

import { EditProjectClient } from './edit-project-client';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProjectClient projectId={id} />;
}

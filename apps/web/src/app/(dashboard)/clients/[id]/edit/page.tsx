import { EditClientClient } from './edit-client-client';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditClientClient clientId={id} />;
}

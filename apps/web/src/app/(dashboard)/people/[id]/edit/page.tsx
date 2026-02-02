import { EditPersonClient } from './edit-person-client';

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPersonClient personId={id} />;
}

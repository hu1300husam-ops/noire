import { AdminProductEditor } from '@/components/admin';

export default function AdminProductEditorPage({ params }: { params: { productId: string } }) {
  return <AdminProductEditor productId={params.productId} />;
}

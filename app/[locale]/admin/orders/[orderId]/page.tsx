import { AdminOrderDossier } from '@/components/admin';

export default function AdminOrderDossierPage({ params }: { params: { orderId: string } }) {
  return <AdminOrderDossier orderId={params.orderId} />;
}

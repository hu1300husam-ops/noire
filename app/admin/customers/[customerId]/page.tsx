import { AdminCustomerDossier } from '@/components/admin';

export default function AdminCustomerDossierPage({ params }: { params: { customerId: string } }) {
  return <AdminCustomerDossier customerId={params.customerId} />;
}

import { AdminLoadingState } from '@/components/admin/admin-primitives';

export default function AdminLoading() {
  return (
    <main id="main-content" className="min-w-0">
      <AdminLoadingState label="Loading the Command Center" rows={7} />
    </main>
  );
}

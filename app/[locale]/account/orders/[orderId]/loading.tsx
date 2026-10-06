import { AccountOrderSkeleton } from '@/components/account';
import { Container } from '@/components/layout';

export default function AccountOrderLoading() {
  return (
    <main id="main-content" className="bg-background py-10 text-foreground sm:py-14">
      <Container size="wide">
        <AccountOrderSkeleton />
      </Container>
    </main>
  );
}

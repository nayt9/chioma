import { StellarAccountsView } from '@/components/stellar/StellarAccountsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stellar Accounts',
  description: 'Manage your Stellar blockchain accounts',
};

export default function StellarAccountsPage() {
  return <StellarAccountsView />;
}

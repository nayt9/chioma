import { apiClient } from '@/lib/api-client';

export interface ManagedStellarAccount {
  id: number;
  publicKey: string;
  accountType: 'USER' | 'ESCROW' | 'FEE' | 'PLATFORM';
  balance: string;
  sequenceNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Enriched from Horizon (optional)
  networkBalance?: string;
  signers?: NetworkSigner[];
  trustlines?: NetworkTrustline[];
  dataEntries?: Record<string, string>;
}

export interface NetworkSigner {
  key: string;
  weight: number;
  type: string;
}

export interface NetworkTrustline {
  assetCode: string;
  assetIssuer: string;
  balance: string;
  limit: string;
}

export interface NetworkAccountInfo {
  publicKey: string;
  sequenceNumber: string;
  balances: {
    asset_type: string;
    asset_code?: string;
    balance: string;
    asset_issuer?: string;
  }[];
  subentryCount: number;
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
  signers: { key: string; weight: number; type: string }[];
  flags: Record<string, boolean>;
  data?: Record<string, string>;
}

export async function fetchUserStellarAccounts(
  userId: string,
): Promise<ManagedStellarAccount[]> {
  const { data } = await apiClient.get<ManagedStellarAccount[]>(
    `/stellar/accounts/user/${userId}`,
  );
  return data ?? [];
}

export async function fetchStellarAccountById(
  id: number,
): Promise<ManagedStellarAccount> {
  const { data } = await apiClient.get<ManagedStellarAccount>(
    `/stellar/accounts/${id}`,
  );
  return data;
}

export async function fetchNetworkAccountInfo(
  publicKey: string,
): Promise<NetworkAccountInfo> {
  const { data } = await apiClient.get<NetworkAccountInfo>(
    `/stellar/accounts/${publicKey}/network`,
  );
  return data;
}

export async function syncStellarAccount(
  publicKey: string,
): Promise<ManagedStellarAccount> {
  const { data } = await apiClient.post<ManagedStellarAccount>(
    `/stellar/accounts/${publicKey}/sync`,
    {},
  );
  return data;
}

export function exportAccountData(account: ManagedStellarAccount): void {
  const payload = {
    publicKey: account.publicKey,
    accountType: account.accountType,
    balance: account.balance,
    isActive: account.isActive,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stellar-account-${account.publicKey.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

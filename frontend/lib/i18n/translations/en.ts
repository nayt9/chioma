export interface TranslationKeys {
  common: {
    loading: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    search: string;
    filter: string;
    export: string;
    connect: string;
    disconnect: string;
    settings: string;
    profile: string;
    logout: string;
    noResults: string;
    error: string;
    retry: string;
  };
  nav: {
    dashboard: string;
    properties: string;
    messages: string;
    payments: string;
    documents: string;
    notifications: string;
    stellarAccounts: string;
    transactions: string;
    profile: string;
    security: string;
  };
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginSuccess: string;
    logoutSuccess: string;
    invalidCredentials: string;
    sessionExpired: string;
  };
  stellar: {
    accounts: string;
    account: string;
    publicKey: string;
    balance: string;
    status: string;
    active: string;
    inactive: string;
    accountType: string;
    createdAt: string;
    lastActivity: string;
    history: string;
    settings: string;
    connectAccount: string;
    disconnectAccount: string;
    noAccounts: string;
    syncAccount: string;
    exportData: string;
    signers: string;
    trustlines: string;
    dataEntries: string;
    sequenceNumber: string;
  };
  messaging: {
    messages: string;
    newMessage: string;
    send: string;
    typeMessage: string;
    noConversations: string;
    searchConversations: string;
    connected: string;
    reconnecting: string;
    typing: string;
    today: string;
    yesterday: string;
    startConversation: string;
    fileAttachment: string;
    readReceipt: string;
    sent: string;
  };
  errors: {
    network: string;
    server: string;
    unauthorized: string;
    notFound: string;
    validation: string;
    unknown: string;
  };
  payments: {
    payments: string;
    amount: string;
    status: string;
    date: string;
    pending: string;
    completed: string;
    failed: string;
    initiated: string;
  };
}

export const en: TranslationKeys = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    connect: 'Connect',
    disconnect: 'Disconnect',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Log out',
    noResults: 'No results found',
    error: 'Something went wrong',
    retry: 'Retry',
  },
  nav: {
    dashboard: 'Dashboard',
    properties: 'Properties',
    messages: 'Messages',
    payments: 'Payments',
    documents: 'Documents',
    notifications: 'Notifications',
    stellarAccounts: 'Stellar Accounts',
    transactions: 'Transactions',
    profile: 'Profile',
    security: 'Security',
  },
  auth: {
    login: 'Log in',
    signup: 'Sign up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    loginSuccess: 'Login successful',
    logoutSuccess: 'Logged out successfully',
    invalidCredentials: 'Invalid email or password',
    sessionExpired: 'Your session has expired. Please log in again.',
  },
  stellar: {
    accounts: 'Stellar Accounts',
    account: 'Stellar Account',
    publicKey: 'Public Key',
    balance: 'Balance',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    accountType: 'Account Type',
    createdAt: 'Created',
    lastActivity: 'Last Activity',
    history: 'Transaction History',
    settings: 'Account Settings',
    connectAccount: 'Connect Account',
    disconnectAccount: 'Disconnect Account',
    noAccounts: 'No Stellar accounts found',
    syncAccount: 'Sync Account',
    exportData: 'Export Data',
    signers: 'Signers',
    trustlines: 'Trustlines',
    dataEntries: 'Data Entries',
    sequenceNumber: 'Sequence Number',
  },
  messaging: {
    messages: 'Messages',
    newMessage: 'New Message',
    send: 'Send',
    typeMessage: 'Type a message...',
    noConversations: 'No conversations yet',
    searchConversations: 'Search conversations...',
    connected: 'Connected',
    reconnecting: 'Reconnecting...',
    typing: 'typing...',
    today: 'Today',
    yesterday: 'Yesterday',
    startConversation: 'Start the conversation',
    fileAttachment: 'Attach file',
    readReceipt: 'Read',
    sent: 'Sent',
  },
  errors: {
    network: 'Network error. Please check your connection.',
    server: 'Server error. Please try again later.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Please check your input and try again.',
    unknown: 'An unexpected error occurred.',
  },
  payments: {
    payments: 'Payments',
    amount: 'Amount',
    status: 'Status',
    date: 'Date',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    initiated: 'Payment initiated',
  },
};

/** Central registry of all backend route paths (no base URL here). */
export const ENDPOINTS = {
  health: '/health',
  campaigns: {
    list: '/campaigns',
    byId: (id: string) => `/campaigns/${id}`,
  },
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    checkSlug: '/auth/signup/check-slug',
    oauthConfig: '/auth/oauth/config',
    oauthGoogle: '/auth/oauth/google',
    oauthApple: '/auth/oauth/apple',
    signupOAuthComplete: '/auth/signup/oauth/complete',
  },
  platform: {
    authOAuth: '/platform/auth-oauth',
    tenants: {
      list: '/platform/tenants',
      byId: (id: string) => `/platform/tenants/${id}`,
      users: (id: string) => `/platform/tenants/${id}/users`,
      campaigns: (id: string) => `/platform/tenants/${id}/campaigns`,
      emailCampaigns: (id: string) => `/platform/tenants/${id}/email-campaigns`,
      mailboxes: (id: string) => `/platform/tenants/${id}/mailboxes`,
      invitations: (id: string) => `/platform/tenants/${id}/invitations`,
    },
  },
  roles: {
    list: '/roles',
    byId: (id: string) => `/roles/${id}`,
  },
  abacPolicies: {
    list: '/abac-policies',
    byId: (id: string) => `/abac-policies/${id}`,
    bulkAssign: '/abac-policies/bulk-assign',
  },
  permissions: {
    list: '/permissions',
  },
  users: {
    list: '/users',
    byId: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
    abacPolicies: (id: string) => `/users/${id}/abac-policies`,
  },
  invitations: {
    list: '/invitations',
    byId: (id: string) => `/invitations/${id}`,
    validate: (token: string) => `/invitations/${token}/validate`,
    accept: (token: string) => `/invitations/${token}/accept`,
  },
  tablePreferences: {
    effective: (tableName: string) =>
      `/table-preferences/${tableName}/effective`,
    defaults: (tableName: string) => `/table-preferences/${tableName}/defaults`,
    user: (tableName: string) => `/table-preferences/${tableName}`,
  },
  mailboxes: {
    list: '/mailboxes',
    byId: (id: string) => `/mailboxes/${id}`,
    campaigns: (id: string) => `/mailboxes/${id}/campaigns`,
    status: (id: string) => `/mailboxes/${id}/status`,
    oauthAvailability: '/mailboxes/oauth/availability',
    domainDns: '/mailboxes/domain-dns',
    testSend: (id: string) => `/mailboxes/${id}/test-send`,
  },
  emailCampaigns: {
    list: '/email-campaigns',
    metricsSummary: '/email-campaigns/metrics-summary',
    byId: (id: string) => `/email-campaigns/${id}`,
    delete: (id: string) => `/email-campaigns/${id}`,
    progress: (id: string) => `/email-campaigns/${id}/progress`,
    recipients: (id: string) => `/email-campaigns/${id}/recipients`,
    recipient: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}`,
    events: (id: string) => `/email-campaigns/${id}/events`,
    dailyEvents: (id: string) => `/email-campaigns/${id}/events/daily`,
    trackingHealth: (id: string) => `/email-campaigns/${id}/tracking-health`,
    recipientEvents: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/events`,
    schedule: (id: string) => `/email-campaigns/${id}/schedule`,
    status: (id: string) => `/email-campaigns/${id}/status`,
    audienceRecipients: '/email-campaigns/recipients/audience',
    excludeRecipient: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/exclude`,
    includeRecipient: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/include`,
    pauseRecipient: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/pause`,
    stopRecipient: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/stop`,
    resumeRecipient: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/resume`,
    excludeRecipientGlobally: (id: string, recipientId: string) =>
      `/email-campaigns/${id}/recipients/${recipientId}/exclude-globally`,
    pause: (id: string) => `/email-campaigns/${id}/pause`,
    stop: (id: string) => `/email-campaigns/${id}/stop`,
    resume: (id: string) => `/email-campaigns/${id}/resume`,
    syncTracking: '/email-campaigns/sync-tracking',
    trackingStatus: '/email-campaigns/tracking-status',
    deleteRequests: '/email-campaigns/delete-requests',
    deleteRequestSummaryCount: '/email-campaigns/delete-requests/summary-count',
    deleteRequestPendingCount: '/email-campaigns/delete-requests/pending-count',
    deleteRequestApprove: (id: string) =>
      `/email-campaigns/delete-requests/${id}/approve`,
    deleteRequestReject: (id: string) =>
      `/email-campaigns/delete-requests/${id}/reject`,
    deleteRequestCancel: (id: string) =>
      `/email-campaigns/delete-requests/${id}/cancel`,
    mailboxSenders: (id: string) => `/email-campaigns/${id}/mailbox-senders`,
    mailboxSender: (id: string, senderId: string) =>
      `/email-campaigns/${id}/mailbox-senders/${senderId}`,
    pauseMailboxSender: (id: string, senderId: string) =>
      `/email-campaigns/${id}/mailbox-senders/${senderId}/pause`,
    stopMailboxSender: (id: string, senderId: string) =>
      `/email-campaigns/${id}/mailbox-senders/${senderId}/stop`,
    resumeMailboxSender: (id: string, senderId: string) =>
      `/email-campaigns/${id}/mailbox-senders/${senderId}/resume`,
    mergeFieldCatalog: '/email-campaigns/merge-field-catalog',
    customFields: {
      list: '/email-campaigns/custom-fields',
      options: (id: string) => `/email-campaigns/custom-fields/${id}/options`,
    },
  },
  emailInbox: {
    replies: '/email-inbox/replies',
    markReplyDone: (recipientId: string) =>
      `/email-inbox/replies/${recipientId}/mark-done`,
  },
  emailExcluded: {
    list: '/email-excluded',
    listContacts: '/email-excluded/list-contacts',
    createListContact: '/email-excluded/list-contacts',
    assignListContact: '/email-excluded/list-contacts/assign-to-list',
    create: '/email-excluded',
    fromList: '/email-excluded/from-list',
    byId: (id: string) => `/email-excluded/${id}`,
  },
  emailConfig: {
    options: {
      list: '/email-config/options',
      byId: (id: string) => `/email-config/options/${id}`,
    },
  },
  emailCampaignIdFormat: {
    get: '/email-campaign-id-format',
    set: '/email-campaign-id-format',
  },
  emailTemplates: {
    list: '/email-templates',
    byId: (id: string) => `/email-templates/${id}`,
  },
  emailAttachments: {
    byId: (id: string) => `/email-attachments/${id}`,
    campaignStep: (campaignId: string, stepOrder: number) =>
      `/email-campaigns/${campaignId}/steps/${stepOrder}/attachments`,
    templateStep: (templateId: string, stepOrder: number) =>
      `/email-templates/${templateId}/steps/${stepOrder}/attachments`,
    copyFromTemplate: (
      campaignId: string,
      stepOrder: number,
      templateStepId: string,
    ) =>
      `/email-campaigns/${campaignId}/steps/${stepOrder}/attachments/copy-from-template/${templateStepId}`,
  },
  contactLists: {
    list: '/contact-lists',
    byId: (id: string) => `/contact-lists/${id}`,
    members: (id: string) => `/contact-lists/${id}/members`,
    memberRemovalPreview: (listId: string, memberId: string) =>
      `/contact-lists/${listId}/members/${memberId}/removal-preview`,
    memberById: (listId: string, memberId: string) =>
      `/contact-lists/${listId}/members/${memberId}`,
    enrollmentOptions: (id: string) =>
      `/contact-lists/${id}/members/enrollment-options`,
    enrollInCampaigns: (id: string) =>
      `/contact-lists/${id}/members/enroll-in-campaigns`,
    importPreview: '/contact-lists/import/preview',
    import: '/contact-lists/import',
    appendImportPreview: (id: string) => `/contact-lists/${id}/import/preview`,
    appendImport: (id: string) => `/contact-lists/${id}/import`,
  },
  manualLists: {
    list: '/manual-lists',
    byId: (id: string) => `/manual-lists/${id}`,
    create: '/manual-lists',
    rows: (id: string) => `/manual-lists/${id}/rows`,
    rowRemovalPreview: (listId: string, rowId: string) =>
      `/manual-lists/${listId}/rows/${rowId}/removal-preview`,
    rowById: (listId: string, rowId: string) =>
      `/manual-lists/${listId}/rows/${rowId}`,
    enrollmentOptions: (id: string) =>
      `/manual-lists/${id}/rows/enrollment-options`,
    enrollInCampaigns: (id: string) =>
      `/manual-lists/${id}/rows/enroll-in-campaigns`,
    appendImportPreview: (id: string) => `/manual-lists/${id}/import/preview`,
    appendImport: (id: string) => `/manual-lists/${id}/import`,
  },
  prospects: {
    list: '/prospects',
    stub: '/prospects/stub',
    search: '/prospects/search',
    fieldSchema: '/prospects/field-schema',
    pipelineSummary: '/prospects/pipeline/summary',
    followups: '/prospects/followups',
    byId: (id: string) => `/prospects/${id}`,
    engagements: (id: string) => `/prospects/${id}/engagements`,
    campaigns: (id: string) => `/prospects/${id}/campaigns`,
    deleteRequests: '/prospects/delete-requests',
    deleteRequestSummaryCount: '/prospects/delete-requests/summary-count',
    deleteRequestPendingCount: '/prospects/delete-requests/pending-count',
    deleteRequestApprove: (id: string) =>
      `/prospects/delete-requests/${id}/approve`,
    deleteRequestReject: (id: string) =>
      `/prospects/delete-requests/${id}/reject`,
    deleteRequestCancel: (id: string) =>
      `/prospects/delete-requests/${id}/cancel`,
    importPreview: '/prospects/import/preview',
    import: '/prospects/import',
    bant: (id: string) => `/prospects/${id}/bant`,
  },
  companies: {
    list: '/companies',
    fieldSchema: '/companies/field-schema',
    byId: (id: string) => `/companies/${id}`,
    bulkDelete: '/companies/bulk-delete',
    importPreview: '/companies/import/preview',
    import: '/companies/import',
  },
  meetings: {
    list: '/meetings',
    summary: '/meetings/summary',
    calendar: '/meetings/calendar',
    cancel: (id: string) => `/meetings/${id}/cancel`,
  },
  calendarConnections: {
    list: '/calendar-connections',
    availability: '/calendar-connections/availability',
    disconnect: (provider: string) => `/calendar-connections/${provider}`,
  },
  companyConfig: {
    options: {
      list: '/company-config/options',
      byId: (id: string) => `/company-config/options/${id}`,
    },
  },
  locationSettings: {
    root: '/location-settings',
    test: '/location-settings/test',
  },
  notion: {
    connection: '/notion/connection',
    databases: '/notion/databases',
    columns: (databaseId: string, destination: string) =>
      `/notion/databases/${databaseId}/columns?destination=${encodeURIComponent(destination)}`,
    import: '/notion/import',
  },
  bantSettings: {
    get: '/bant-settings',
    update: '/bant-settings',
  },
  location: {
    search: '/location/search',
    status: '/location/status',
  },
  analytics: {
    dashboards: '/analytics/dashboards',
    dashboard: (id: string) => `/analytics/dashboards/${id}`,
    widgets: (dashboardId: string) => `/analytics/dashboards/${dashboardId}/widgets`,
    widget: (dashboardId: string, widgetId: string) =>
      `/analytics/dashboards/${dashboardId}/widgets/${widgetId}`,
    query: '/analytics/query',
    filterOptions: '/analytics/filter-options',
    campaignCount: '/analytics/campaign-count',
  },
  auditLogs: {
    list: '/audit-logs',
    platformList: '/platform/audit-logs',
  },
  website: {
    properties: '/website/properties',
    property: (id: string) => `/website/properties/${id}`,
    onPageAudits: '/website/on-page/audits',
    onPageAudit: (id: string) => `/website/on-page/audits/${id}`,
    onPageAuditPages: (id: string) => `/website/on-page/audits/${id}/pages`,
    triggerOnPageAudit: '/website/on-page/audits/trigger',
    googleConnection: {
      availability: '/website/google-connection/availability',
      list: '/website/google-connections',
      byId: (connectionId: string) => `/website/google-connections/${connectionId}`,
      oauthStart: '/website/google-connections/oauth/start',
      property: (propertyId: string) =>
        `/website/properties/${propertyId}/google-connection`,
      propertyOAuthStart: (propertyId: string) =>
        `/website/properties/${propertyId}/google-connection/oauth/start`,
    },
    googleOAuthApps: {
      list: '/website/google-oauth-apps',
      connectReady: '/website/google-oauth-apps/connect-ready',
      byId: (id: string) => `/website/google-oauth-apps/${id}`,
    },
    googleProperties: {
      suggestions: '/website/google-properties/suggestions',
    },
    settings: {
      psi: '/website/settings/psi',
      psiTest: '/website/settings/psi/test',
      googleOAuth: '/website/settings/google-oauth',
    },
  },
} as const;

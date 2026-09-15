import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

const RESOURCE_LABELS: Record<string, string> = {
  campaigns: 'Campaigns',
  prospects: 'Prospects',
  companies: 'Companies',
  'company-config': 'Company config',
  'bant-settings': 'BANT settings',
  website: 'Website',
  settings: 'Settings',
  rbac: 'RBAC',
  forms: 'Forms',
};

const RESOURCE_ICONS: Record<string, SvgIconComponent> = {
  campaigns: CampaignOutlinedIcon,
  prospects: PeopleOutlinedIcon,
  companies: BusinessOutlinedIcon,
  'company-config': BusinessOutlinedIcon,
  settings: SettingsOutlinedIcon,
  rbac: ShieldOutlinedIcon,
  forms: DynamicFormOutlinedIcon,
};

const ACTION_LABELS: Record<string, string> = {
  read: 'Read',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  manage: 'Manage',
  'manage-fields': 'Manage fields',
  'manage-integrations': 'Manage integrations',
  'approve-delete': 'Approve delete',
  'request-delete': 'Request delete',
};

export type ActionBadgeColor = 'info' | 'warning' | 'error' | 'default';

export function getResourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
}

export function getResourceIcon(resource: string): SvgIconComponent {
  return RESOURCE_ICONS[resource] ?? ShieldOutlinedIcon;
}

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function getActionBadgeColor(action: string): ActionBadgeColor {
  switch (action) {
    case 'read':
      return 'info';
    case 'create':
    case 'update':
      return 'warning';
    case 'delete':
    case 'manage':
      return 'error';
    default:
      return 'default';
  }
}

export function formatPermissionDescription(
  description: string | null,
  action: string,
): string {
  if (description) {
    return description;
  }

  return `${getActionLabel(action)} permission`;
}

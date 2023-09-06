import { PopupPath } from '../paths';
import { Settings } from './settings';
import { SettingsAdvanced } from './settings-advanced';
import { SettingsContacts } from './settings-contacts';
import { SettingsNetworks } from './settings-networks';
import { SettingsPermission } from './settings-permission';
import { SettingsSecurity } from './settings-security';

export const settingsRoutes = [
  {
    path: PopupPath.SETTINGS_INDEX,
    element: <Settings />,
  },
  {
    path: PopupPath.SETTINGS_ADVANCED,
    element: <SettingsAdvanced />,
  },
  {
    path: PopupPath.SETTINGS_CONTACTS,
    element: <SettingsContacts />,
  },
  {
    path: PopupPath.SETTINGS_SECURITY,
    element: <SettingsSecurity />,
  },
  {
    path: PopupPath.SETTINGS_NETWORKS,
    element: <SettingsNetworks />,
  },
  {
    path: PopupPath.SETTINGS_PERMISSION,
    element: <SettingsPermission />,
  },
];

import { PopupPath } from '../paths';
import { Settings } from './settings';
import { SettingsAdvanced } from './settings-advanced';
import { SettingsAutoLock } from './settings-auto-lock';
import { SettingsClearCache } from './settings-clear-cache';
import { SettingsConnectedSites } from './settings-connected-sites';
import { SettingsFullViewingKey } from './settings-full-viewing-key';
import { SettingsNetworkEdit } from './settings-network-edit';
import { SettingsNetworks } from './settings-networks';
import { SettingsPassphrase } from './settings-passphrase';
import { SettingsPermission } from './settings-permission';
import { SettingsSecurity } from './settings-security';
import { SettingsSpendKey } from './settings-spend-key';

export const settingsRoutes = [
  {
    path: PopupPath.SETTINGS,
    element: <Settings />,
  },
  {
    path: PopupPath.SETTINGS_ADVANCED,
    element: <SettingsAdvanced />,
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
  {
    path: PopupPath.SETTINGS_CONNECTED_SITES,
    element: <SettingsConnectedSites />,
  },
  {
    path: PopupPath.SETTINGS_AUTO_LOCK,
    element: <SettingsAutoLock />,
  },
  {
    path: PopupPath.SETTINGS_CLEAR_CACHE,
    element: <SettingsClearCache />,
  },
  {
    path: PopupPath.SETTINGS_RECOVERY_PASSPHRASE,
    element: <SettingsPassphrase />,
  },
  {
    path: PopupPath.SETTINGS_FULL_VIEWING_KEY,
    element: <SettingsFullViewingKey />,
  },
  {
    path: PopupPath.SETTINGS_SPEND_KEY,
    element: <SettingsSpendKey />,
  },
  {
    path: PopupPath.SETTINGS_NETWORK_NAME,
    element: <SettingsNetworkEdit />,
  },
];

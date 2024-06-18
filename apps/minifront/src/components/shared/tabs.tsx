import { PagePath } from '../metadata/paths';
import { useNavigate } from 'react-router-dom';
import { SegmentedPicker } from '@repo/ui/components/ui/segmented-picker';
import { ComponentProps } from 'react';

export interface Tab {
  title: string;
  enabled: boolean;
  href: PagePath;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: PagePath;
  className?: string;
}

export const Tabs = ({ tabs, activeTab }: TabsProps) => {
  const navigate = useNavigate();
  const options: ComponentProps<typeof SegmentedPicker>['options'] = tabs
    .filter(tab => tab.enabled)
    .map(tab => ({
      label: tab.title,
      value: tab.href,
    }));

  return (
    <SegmentedPicker
      value={activeTab}
      onChange={value => navigate(value.toString())}
      options={options}
      grow
      size='lg'
    />
  );
};

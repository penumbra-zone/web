'use client';

import React, { FC, useCallback, useState, Suspense } from 'react';
import cn from 'clsx';
import { ThemeKeys } from '@microlink/react-json-view';

// Dynamically import @microlink/react-json-view using React.lazy
const ReactJsonView = React.lazy(() => import('@microlink/react-json-view'));

export type ReactJsonViewTheme =
  | 'apathy'
  | 'ashes'
  | 'atelierDune'
  | 'atelierForest'
  | 'atelierHeath'
  | 'atelierLakeside'
  | 'atelierSeaside'
  | 'bespin'
  | 'brewer'
  | 'bright'
  | 'chalk'
  | 'codeschool'
  | 'colors'
  | 'eighties'
  | 'embers'
  | 'flat'
  | 'google'
  | 'grayscale'
  | 'greenscreen'
  | 'harmonic'
  | 'hopscotch'
  | 'isotope'
  | 'marrakesh'
  | 'mocha'
  | 'monokai'
  | 'ocean'
  | 'paraiso'
  | 'pop'
  | 'railscasts'
  | 'shapeshifter'
  | 'solarized'
  | 'summerfruit'
  | 'threezerotwofour'
  | 'tomorrow'
  | 'tube'
  | 'twilight'
  | 'rjv-default'; // Added rjv-default as it's mentioned as a default

export interface JsonViewerProps {
  /** The JavaScript object to display as a JSON tree. */
  data: object;
  /** Initial collapse depth. Defaults to 1.
   *  Can be set to `true` to collapse all, or a number for levels to expand.
   */
  collapsed?: boolean | number;
  /** Theme for the JSON viewer. Defaults to 'rjv-default' for a cleaner, lighter appearance. */
  theme?: ThemeKeys;
  /** Background color for the viewer. Defaults to white for better contrast. */
  backgroundColor?: string;
  /** Fallback UI to show while the JSON viewer is loading. */
  loadingFallback?: React.ReactNode;
  /** Apply modern styling that matches Figma design. Defaults to true. */
  modernStyle?: boolean;
}

export const JsonViewer: FC<JsonViewerProps> = ({
  data,
  collapsed = 1,
  theme = 'rjv-default',
  backgroundColor = '#ffffff',
  loadingFallback = <div>Loading JSON Viewer...</div>,
  modernStyle = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  return (
    <div
      className={cn(
        'rounded-lg p-4 font-mono text-sm font-normal break-all',
        modernStyle ? 'bg-white border border-gray-200 shadow-sm' : 'bg-neutral-900/50',
      )}
      onClick={handleViewClick}
    >
      <Suspense fallback={loadingFallback}>
        <ReactJsonView
          src={data}
          collapsed={isExpanded ? 2 : collapsed}
          enableClipboard={false}
          style={{
            background: backgroundColor,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          theme={theme}
          displayDataTypes={false}
          displayObjectSize={false}
        />
      </Suspense>
    </div>
  );
};

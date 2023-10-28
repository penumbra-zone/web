'use client';

import * as React from 'react';
import { cn } from '../../../../lib/utils';

export interface ViewBoxProps {
    label: string;
    visibleContent?: React.ReactElement;
}

const ViewBox: React.FC<ViewBoxProps> = ({ label, visibleContent }) => {
    return (
        <div
            className={cn(
                'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
                (!visibleContent ? 'cursor-not-allowed' : '')
            )}
        >
            <div className='flex items-center gap-2 self-start'>
                {/* !visibleContent ? (
                    <FilledImage src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
                ) : null */}
                <span className={cn(
                    'text-base font-bold',
                    (!visibleContent ? 'text-gray-600' : '')
                )}>
                    {label}
                    {!visibleContent ? ' (Encrypted)' /* Delete this and replace with an incognito icon */ : null}
                </span>
            </div>
            {visibleContent}
        </div>
    );
}

export interface ViewSectionProps {
    heading: string,
    children?: React.ReactNode,
}

const ViewSection: React.FC<ViewSectionProps> = ({ heading, children }) => {
    return (
        <div className='grid gap-4 pt-4 pb-4'>
            <div className='text-xl font-bold'>{heading}</div>
            {children}
        </div>
    );
}

export { ViewBox, ViewSection };
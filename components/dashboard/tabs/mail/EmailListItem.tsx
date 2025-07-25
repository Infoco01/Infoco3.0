import React from 'react';
import { ZohoEmailListItem } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { timeAgo } from '../../../../lib/utils';

interface EmailListItemProps {
    email: ZohoEmailListItem;
    isSelected: boolean;
    onSelect: () => void;
}

const EmailListItem: React.FC<EmailListItemProps> = ({ email, isSelected, onSelect }) => {
    return (
        <li
            onClick={onSelect}
            className={cn(
                'p-4 border-b cursor-pointer hover:bg-gray-50',
                isSelected ? 'bg-blue-50' : 'bg-white',
                !email.isRead && 'font-bold'
            )}
        >
            <div className="flex justify-between items-center text-sm">
                <p className={cn("truncate", !email.isRead ? 'text-gray-900' : 'text-gray-700')}>{email.from.name || email.from.emailAddress}</p>
                <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{timeAgo(email.receivedTime)}</p>
            </div>
            <p className={cn("truncate text-sm mt-1", !email.isRead ? 'text-gray-800' : 'text-gray-600')}>{email.subject}</p>
            <p className="truncate text-xs text-gray-500 mt-1 font-normal">{email.summary}</p>
        </li>
    );
};

export default EmailListItem;

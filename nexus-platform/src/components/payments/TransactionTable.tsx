import React from 'react';
import { Badge } from '../ui/Badge';
import { Transaction } from '../../types';
import { ArrowDownLeft, ArrowUpRight, Repeat, Landmark } from 'lucide-react';

const ICONS = { deposit: ArrowDownLeft, withdraw: ArrowUpRight, transfer: Repeat, funding: Landmark };

interface Props {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<Props> = ({ transactions }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b border-gray-200">
          <th className="py-2 pr-4">Type</th>
          <th className="py-2 pr-4">Amount</th>
          <th className="py-2 pr-4">Sender</th>
          <th className="py-2 pr-4">Receiver</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2 pr-4">Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(tx => {
          const Icon = ICONS[tx.type];
          return (
            <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 pr-4 flex items-center gap-2 capitalize"><Icon size={14} className="text-gray-500" />{tx.type}</td>
              <td className="py-3 pr-4 font-medium text-gray-900">${tx.amount.toLocaleString()}</td>
              <td className="py-3 pr-4 text-gray-600">{tx.sender}</td>
              <td className="py-3 pr-4 text-gray-600">{tx.receiver}</td>
              <td className="py-3 pr-4">
                <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'} size="sm">
                  {tx.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-gray-500">{tx.date}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

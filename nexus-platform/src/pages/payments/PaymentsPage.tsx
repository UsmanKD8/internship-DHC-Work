import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Repeat, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TransactionTable } from '../../components/payments/TransactionTable';
import { useAuth } from '../../context/AuthContext';
import { loadTransactions, saveTransactions, loadWallet, saveWallet } from '../../data/transactions';
import { Transaction } from '../../types';
import toast from 'react-hot-toast';

type Action = 'deposit' | 'withdraw' | 'transfer' | 'funding' | null;

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [action, setAction] = useState<Action>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  useEffect(() => {
    setBalance(loadWallet());
    setTransactions(loadTransactions());
  }, []);

  const closeModal = () => {
    setAction(null);
    setAmount('');
    setRecipient('');
    setCard({ number: '', expiry: '', cvc: '' });
  };

  const submit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if ((action === 'withdraw' || action === 'transfer') && amt > balance) return toast.error('Insufficient balance');

    const tx: Transaction = {
      id: `t${Date.now()}`,
      type: action!,
      amount: amt,
      sender: action === 'deposit' ? 'Bank/Card' : user?.name || 'You',
      receiver: action === 'deposit' ? user?.name || 'You' : action === 'withdraw' ? 'Bank/Card' : recipient || 'Recipient',
      status: 'completed',
      date: new Date().toISOString().slice(0, 10),
    };

    const newBalance = action === 'deposit' ? balance + amt : balance - amt;
    const newTxs = [tx, ...transactions];

    setBalance(newBalance);
    setTransactions(newTxs);
    saveWallet(newBalance);
    saveTransactions(newTxs);
    toast.success(`${action} of $${amt.toLocaleString()} completed`);
    closeModal();
  };

  const actionConfig = {
    deposit: { title: 'Deposit Funds', icon: ArrowDownLeft, needsCard: true, needsRecipient: false },
    withdraw: { title: 'Withdraw Funds', icon: ArrowUpRight, needsCard: true, needsRecipient: false },
    transfer: { title: 'Transfer Funds', icon: Repeat, needsCard: false, needsRecipient: true },
    funding: { title: 'Fund a Deal', icon: Wallet, needsCard: false, needsRecipient: true },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage your wallet, deposits, and deal funding</p>
      </div>

      {/* Wallet card */}
      <Card className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <CardBody>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-200 text-sm">Wallet Balance</p>
              <h2 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h2>
            </div>
            <Wallet size={32} className="text-primary-200" />
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Button variant="accent" size="sm" leftIcon={<ArrowDownLeft size={16} />} onClick={() => setAction('deposit')}>Deposit</Button>
            <Button variant="secondary" size="sm" leftIcon={<ArrowUpRight size={16} />} onClick={() => setAction('withdraw')}>Withdraw</Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" size="sm" leftIcon={<Repeat size={16} />} onClick={() => setAction('transfer')}>Transfer</Button>
            {user?.role === 'investor' && (
              <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" size="sm" leftIcon={<Wallet size={16} />} onClick={() => setAction('funding')}>Fund a Deal</Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          <TransactionTable transactions={transactions} />
        </CardBody>
      </Card>

      {/* Action modal - styled like a Stripe/PayPal checkout */}
      <Modal open={!!action} onClose={closeModal} title={action ? actionConfig[action].title : ''}>
        {action && (
          <div className="space-y-4">
            <Input label="Amount (USD)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" fullWidth />

            {actionConfig[action].needsRecipient && (
              <Input label={action === 'funding' ? 'Startup / Deal Name' : 'Recipient'} value={recipient} onChange={e => setRecipient(e.target.value)} fullWidth />
            )}

            {actionConfig[action].needsCard && (
              <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <CreditCard size={16} /> Card Details (mock)
                </div>
                <Input placeholder="4242 4242 4242 4242" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} fullWidth />
                <div className="flex gap-3">
                  <Input placeholder="MM/YY" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} fullWidth />
                  <Input placeholder="CVC" value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} fullWidth />
                </div>
              </div>
            )}

            <Button fullWidth onClick={submit}>Confirm {action}</Button>
            <p className="text-xs text-gray-400 text-center">This is a simulated transaction — no real money moves.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

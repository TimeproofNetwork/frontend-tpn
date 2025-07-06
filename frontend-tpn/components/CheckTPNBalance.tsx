import { useAccount, useNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

export default function CheckTPNBalance() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [checked, setChecked] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [triggerWalletModal, setTriggerWalletModal] = useState<() => void>(() => () => {});

  const handleCheck = async () => {
    console.log('📡 Connected:', isConnected);
    console.log('🌐 Network:', chain?.id);
    console.log('👛 Address:', address);

    if (!isConnected) {
      triggerWalletModal();
      return;
    }

    if (chain?.id !== 11155111) {
      alert('Please switch to Sepolia network.');
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch('/api/checkTPNBalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      });

      const data = await response.json();
      console.log('📊 API Response:', data);

      const fetchedBalance = parseFloat(data.balance);

      if (!isNaN(fetchedBalance)) {
        setBalance(fetchedBalance);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error('❌ API Fetch Error:', error);
      setBalance(0);
    }

    setChecked(true);
    setIsChecking(false);
  };

  const hasEnough = balance >= 100;

  return (
    <div className="bg-[#0D0D0D] border border-[#333333] rounded-2xl p-6 text-white shadow-lg mt-8">
      <h3 className="text-lg font-semibold mb-3">🔄 Check Your TPN Balance</h3>

      <ConnectButton.Custom>
        {({ openConnectModal }: { openConnectModal: () => void }) => {
          useEffect(() => {
            setTriggerWalletModal(() => openConnectModal);
          }, [openConnectModal]);

          return (
            <button
              onClick={handleCheck}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold text-white transition"
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : '🔍 Check TPN Balance'}
            </button>
          );
        }}
      </ConnectButton.Custom>

      {checked && (
        <p className="mt-4 text-base">
          {hasEnough ? (
            <span className="text-green-400 font-medium">
              ✅ You have {balance.toFixed(2)} TPN — You’re ready to register!
            </span>
          ) : (
            <span className="text-red-500 font-medium">
              ❌ Insufficient TPN: You have {balance.toFixed(2)} TPN. Minimum 100 TPN required.
            </span>
          )}
        </p>
      )}
    </div>
  );
}














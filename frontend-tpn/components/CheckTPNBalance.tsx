import { useAccount, useContractRead } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { useState } from 'react';
import TPN_ABI from '@/utils/TPN_ABI.json';  // ✅ ABI must exist here

const TPN_TOKEN_ADDRESS = '0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e';  // ✅ Sepolia TPN Token

export default function CheckTPNBalance() {
  const { address, isConnected } = useAccount();
  const [checked, setChecked] = useState(false);

  const { data, refetch, isFetching } = useContractRead({
    address: TPN_TOKEN_ADDRESS,
    abi: TPN_ABI,
    functionName: 'balanceOf',
    args: [address],
    watch: false,
  });

  const balance = (data && BigNumber.isBigNumber(data))
    ? parseFloat(ethers.utils.formatUnits(data, 18))
    : 0;

  const hasEnough = balance >= 100;

  const handleCheck = () => {
    refetch();
    setChecked(true);
  };

  return (
    <div className="bg-[#0D0D0D] border border-[#333333] rounded-2xl p-6 text-white shadow-lg mt-8">
      <h3 className="text-lg font-semibold mb-3">🔄 Check Your TPN Balance</h3>
      
      <button
        onClick={handleCheck}
        className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] font-semibold text-white transition"
        disabled={!isConnected || isFetching}
      >
        {isFetching ? 'Checking...' : '🔍 Check TPN Balance'}
      </button>

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


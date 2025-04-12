// app/token-vendor/page.tsx
import { useState, useEffect } from "react";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useAccount, useBalance } from "wagmi";
import { 
  useScaffoldContractRead, 
  useScaffoldContractWrite,
  useScaffoldEventHistory
} from "~~/hooks/scaffold-eth";

export default function TokenVendor() {
  const { address } = useAccount();
  const [buyAmount, setBuyAmount] = useState("0.01");
  const [sellAmount, setSellAmount] = useState("1");
  const [approveAmount, setApproveAmount] = useState("10");
  
  // Read contract data
  const { data: yourTokenBalance } = useScaffoldContractRead({
    contractName: "YourToken",
    functionName: "balanceOf",
    args: [address],
  });
  
  const { data: vendorTokenBalance } = useScaffoldContractRead({
    contractName: "YourToken",
    functionName: "balanceOf",
    args: [/* Vendor contract address */],
  });
  
  const { data: vendorAddress } = useScaffoldContractRead({
    contractName: "Vendor",
    functionName: "address",
  });
  
  const { data: tokensPerEth } = useScaffoldContractRead({
    contractName: "Vendor",
    functionName: "tokensPerEth",
  });
  
  const { data: isOwner } = useScaffoldContractRead({
    contractName: "Vendor",
    functionName: "owner",
  });
  
  const { data: allowance } = useScaffoldContractRead({
    contractName: "YourToken",
    functionName: "allowance",
    args: [address, vendorAddress],
  });
  
  // Get ETH balances
  const { data: ethBalance } = useBalance({ address });
  const { data: vendorEthBalance } = useBalance({ address: vendorAddress });
  
  // Write functions
  const { writeAsync: buyTokens } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "buyTokens",
    value: parseEther(buyAmount),
  });
  
  const { writeAsync: approve } = useScaffoldContractWrite({
    contractName: "YourToken",
    functionName: "approve",
    args: [vendorAddress, parseEther(approveAmount)],
  });
  
  const { writeAsync: sellTokens } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "sellTokens",
    args: [parseEther(sellAmount)],
  });
  
  const { writeAsync: withdraw } = useScaffoldContractWrite({
    contractName: "Vendor",
    functionName: "withdraw",
  });
  
  // Event history
  const { data: buyEvents } = useScaffoldEventHistory({
    contractName: "Vendor",
    eventName: "BuyTokens",
    fromBlock: /* blocknumber - 10 */,
  });
  
  const { data: sellEvents } = useScaffoldEventHistory({
    contractName: "Vendor",
    eventName: "SellTokens",
    fromBlock: /* blocknumber - 10 */,
  });
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Token Vendor</h1>
      
      {/* Balances */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Balances</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium">Your Balances</h3>
            <p>ETH: {ethBalance ? formatEther(ethBalance) : "0"}</p>
            <p>Tokens: {yourTokenBalance ? formatEther(yourTokenBalance) : "0"}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Vendor Balances</h3>
            <p>ETH: {vendorEthBalance ? formatEther(vendorEthBalance) : "0"}</p>
            <p>Tokens: {vendorTokenBalance ? formatEther(vendorTokenBalance) : "0"}</p>
          </div>
        </div>
      </div>
      
      {/* Buy Tokens */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Buy Tokens</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="border rounded p-2"
            placeholder="ETH Amount"
          />
          <button
            onClick={() => buyTokens()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Buy Tokens
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Rate: 1 ETH = {tokensPerEth || 100} tokens
        </p>
      </div>
      
      {/* Approve & Sell Tokens */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Sell Tokens</h2>
        
        {/* Approve Section */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Step 1: Approve Tokens</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              className="border rounded p-2"
              placeholder="Token Amount"
            />
            <button
              onClick={() => approve()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Approve
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Current Allowance: {allowance ? formatEther(allowance) : "0"}
          </p>
        </div>
        
        {/* Sell Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">Step 2: Sell Tokens</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="border rounded p-2"
              placeholder="Token Amount"
            />
            <button
              onClick={() => sellTokens()}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sell Tokens
            </button>
          </div>
        </div>
      </div>
      
      {/* Owner Section */}
      {isOwner && isOwner === address && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Owner Actions</h2>
          <button
            onClick={() => withdraw()}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Withdraw ETH
          </button>
        </div>
      )}
      
      {/* Events Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
        
        {/* Buy Events */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Buy Events</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Buyer</th>
                  <th className="px-4 py-2">ETH</th>
                  <th className="px-4 py-2">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {buyEvents && buyEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{event.args.buyer}</td>
                    <td className="border px-4 py-2">{formatEther(event.args.amountOfETH)}</td>
                    <td className="border px-4 py-2">{formatEther(event.args.amountOfTokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Sell Events */}
        <div>
          <h3 className="text-lg font-medium mb-2">Sell Events</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Seller</th>
                  <th className="px-4 py-2">Tokens</th>
                  <th className="px-4 py-2">ETH</th>
                </tr>
              </thead>
              <tbody>
                {sellEvents && sellEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{event.args.seller}</td>
                    <td className="border px-4 py-2">{formatEther(event.args.amountOfTokens)}</td>
                    <td className="border px-4 py-2">{formatEther(event.args.amountOfETH)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ResultDisplay({ result }) {
  if (!result) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);

    // Show temporary notification
    const notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up";
    notification.textContent = `${label} copied!`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Evidence Verified</h3>
            <p className="text-emerald-100 text-sm">
              Successfully recorded on blockchain
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-emerald-100 text-xs font-medium mb-1">
              Networks
            </p>
            <p className="font-semibold text-lg">2 Chains</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-emerald-100 text-xs font-medium mb-1">Status</p>
            <p className="font-semibold text-lg">Immutable</p>
          </div>
        </div>
      </div>

      {/* Data Cards */}
      <div className="space-y-4">
        {/* Record ID */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Record ID
              </label>
            </div>
            <button
              onClick={() => copyToClipboard(result.recordId, "Record ID")}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors group"
              title="Copy to clipboard"
            >
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <code className="text-sm font-mono text-slate-700 break-all">
            {result.recordId}
          </code>
        </div>

        {/* Trip ID ✅ */}
        {result.tripId && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Trip ID
                </label>
              </div>
              <button
                onClick={() => copyToClipboard(result.tripId, "Trip ID")}
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors group"
                title="Copy to clipboard"
              >
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <code className="text-sm font-mono text-slate-700 break-all">
              {result.tripId}
            </code>
          </div>
        )}

        {/* SHA-256 Hash */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                SHA-256 Hash
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic fingerprint
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(result.hash, "Hash")}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors group"
            >
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <code className="text-xs font-mono text-slate-700 break-all leading-relaxed">
            {result.hash}
          </code>
        </div>

        {/* IPFS CID */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                IPFS CID
              </label>
              <p className="text-xs text-blue-600 mt-0.5">
                Distributed storage identifier
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(result.cid, "CID")}
              className="p-1.5 hover:bg-white/50 rounded-md transition-colors group"
            >
              <svg
                className="w-4 h-4 text-blue-600 group-hover:text-blue-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <code className="text-xs font-mono text-blue-800 break-all block mb-3">
            {result.cid}
          </code>
          <a
            href={`https://ipfs.io/ipfs/${result.cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View on IPFS Gateway</span>
            <svg
              className="w-3.5 h-3.5 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* Timestamp */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Timestamp
          </label>
          <p className="text-base font-medium text-slate-900">
            {new Date(result.timestamp * 1000).toLocaleString("en-US", {
              dateStyle: "full",
              timeStyle: "long",
            })}
          </p>
        </div>

        {/* Blockchain Transactions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-4">
            Blockchain Transactions
          </label>
          <div className="space-y-4">
            {/* Arbitrum */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    Arbitrum
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(result.arbitrumTx, "Arbitrum TX")
                  }
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <code className="text-xs font-mono text-slate-600 break-all">
                {result.arbitrumTx}
              </code>
            </div>

            {/* Scroll */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    Scroll
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(result.scrollTx, "Scroll TX")}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <code className="text-xs font-mono text-slate-600 break-all">
                {result.scrollTx}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-900 mb-1">
              Development Mode
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Blockchain transactions are currently using mock values. Once
              smart contracts are deployed on testnets, real transaction hashes
              will be displayed and verifiable on block explorers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

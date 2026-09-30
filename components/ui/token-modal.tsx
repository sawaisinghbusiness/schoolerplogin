"use client";

import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";

export interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId?: string;
  tokenSecret?: string;
}

export function TokenModal({
  isOpen,
  onClose,
  tokenId = "wk-qeT70UaYdJtsCKcOh0rq7G",
  tokenSecret = "ws-MA8EM4NdtYb9mfh1cdg3ih",
}: TokenModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const bearerToken = `Bearer ${tokenId}.${tokenSecret}`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-xl bg-slate-900 border border-zinc-800 text-zinc-100 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Token created
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning / Subtext */}
        <p className="text-xs text-zinc-300 leading-relaxed">
          Copy the token secret and save it somewhere. This is the last time you can see the token secret!
        </p>

        {/* Token ID & Secret Rows */}
        <div className="rounded-lg border border-zinc-800 bg-slate-950 divide-y divide-zinc-800/80 text-xs">
          {/* Token ID */}
          <div className="flex items-center justify-between p-3">
            <span className="text-zinc-400 font-medium">Token ID</span>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-zinc-200">{tokenId}</span>
              <button
                onClick={() => copyToClipboard(tokenId, "id")}
                className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] transition-colors"
              >
                {copiedField === "id" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Token Secret */}
          <div className="flex items-center justify-between p-3">
            <span className="text-zinc-400 font-medium">Token Secret</span>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-zinc-200">{tokenSecret}</span>
              <button
                onClick={() => copyToClipboard(tokenSecret, "secret")}
                className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] transition-colors"
              >
                {copiedField === "secret" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Webhook Headers */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-400">
            When you make requests to a webhook that has proxy auth enabled, you will need to include the following header:
          </p>
          <div className="relative rounded-lg bg-slate-950 border border-zinc-800 p-3 font-mono text-[11px] text-amber-200/90 leading-relaxed">
            <div>Modal-Key: <span className="text-orange-300">{tokenId}</span></div>
            <div>Modal-Secret: <span className="text-orange-300">{tokenSecret}</span></div>
          </div>
        </div>

        {/* Section 2: Bearer Authorization Header */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Alternatively, on Auto Endpoints and Modal Servers you can pass the same credential as a single Authorization header. This is useful for OpenAI-compatible clients and gateways that only accept a bearer token:
          </p>
          <div className="relative rounded-lg bg-slate-950 border border-zinc-800 p-3 font-mono text-[11px] flex items-center justify-between">
            <span className="truncate pr-2">
              <span className="text-zinc-400">Authorization:</span>{" "}
              <span className="text-amber-200/90">{bearerToken}</span>
            </span>
            <button
              onClick={() => copyToClipboard(`Authorization: ${bearerToken}`, "bearer")}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] transition-colors shrink-0"
            >
              {copiedField === "bearer" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenModal;

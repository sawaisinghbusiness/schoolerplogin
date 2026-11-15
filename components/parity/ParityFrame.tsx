"use client";
import { Suspense, type ReactNode } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from '@/components/parity/Link';
import { LangProvider } from '@/components/parity/generated/lib/i18n';
type Action = {
    href: string;
    text: {
        en: string;
        hi: string;
    };
    badge?: {
        en: string;
        hi: string;
    };
};
export function ParityFrame({ title, children, back, action }: {
    title: string;
    children: ReactNode;
    back?: string;
    action?: Action;
}) { return <LangProvider><div className="erp-parity"><header className="page-header"><div>{back && <Link href={back} className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-700"><ArrowLeft className="h-3 w-3"/>Back</Link>}<h1 className="page-title">{title}</h1></div>{action && <Link href={action.href} className="btn btn-secondary"><Plus className="h-4 w-4"/>{action.text.en}</Link>}</header><Suspense fallback={<p role="status">Loading {title.toLowerCase()}...</p>}>{children}</Suspense></div></LangProvider>; }

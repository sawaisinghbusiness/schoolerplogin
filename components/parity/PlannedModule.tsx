"use client";
import { useSearchParams } from 'next/navigation';
import catalog from '@/lib/erp-system.json';
export function PlannedModule({ id }: {
    id?: string;
}) { const query = useSearchParams(); const f = catalog.features.find(f => f.id === (id || 'planned/' + query.get('m')) && f.status === 'planned'); if (!f)
    return <p role="alert">This planned module was not found.</p>; return <div className="space-y-5"><header className="page-header"><h1 className="page-title">{f.title.en}</h1></header><section className="card max-w-3xl p-6"><p className="text-base font-semibold">Not available yet</p><p className="mt-2 text-sm text-slate-500">This module is planned on both ERP web and ERP app. It is not available for school work yet.</p>{'features' in f && <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-700">{f.features?.map((x, i) => <li key={i}>{x.en}</li>)}</ul>}</section></div>; }

import{Suspense}from 'react';
import{PlannedModule}from '@/components/parity/PlannedModule';
export default function Page(){return <Suspense fallback={<p>Loading module...</p>}><PlannedModule id="settings/data"/></Suspense>;}

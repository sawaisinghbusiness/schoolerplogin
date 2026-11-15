"use client";
import { useRouter as useNextRouter } from 'next/navigation';
export { usePathname, useSearchParams, useParams, redirect, notFound } from 'next/navigation';
const mappings: [
    string,
    string
][] = [['/erp/settings/whatsapp', '/settings/messaging'], ['/erp/students/id-cards', '/students/print'], ['/erp/students/photos', '/students/documents'], ['/erp/timetable', '/academics/timetable'], ['/erp/homework', '/academics/homework'], ['/erp/syllabus', '/academics/syllabus'], ['/erp/copy-check', '/academics/copy-check'], ['/erp/reports', '/reports'], ['/erp/report', '/dashboard'], ['/erp/soon', '/planned']];
export function mapErpHref(href: string) { if (href === '/')
    return '/dashboard'; for (const [from, to] of mappings)
    if (href === from || href.startsWith(from + '/') || href.startsWith(from + '?') || href.startsWith(from + '#'))
        return to + href.slice(from.length); return href.startsWith('/erp/') ? href.slice(4) : href; }
export function useRouter() { const router = useNextRouter(); return { ...router, push: (href: string, opts?: {
        scroll?: boolean;
    }) => router.push(mapErpHref(href), opts), replace: (href: string, opts?: {
        scroll?: boolean;
    }) => router.replace(mapErpHref(href), opts) }; }

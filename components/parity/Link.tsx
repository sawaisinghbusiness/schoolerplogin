"use client";
import NextLink from 'next/link';
import { forwardRef, type ComponentProps } from 'react';
import { mapErpHref } from '@/lib/parity/navigation';
export default forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function Link({ href, ...props }, ref) { const mapped = typeof href === 'string' ? mapErpHref(href) : { ...href, pathname: href.pathname ? mapErpHref(href.pathname) : href.pathname }; return <NextLink {...props} href={mapped} ref={ref}/>; });

/** Pages anyone can open without signing in: the school's public website and the login page. */
export const PUBLIC_PAGES = ["/", "/academics", "/admission", "/contact", "/disclosure", "/login"];

export const isPublicPage = (path: string) => PUBLIC_PAGES.includes(path.replace(/\/+$/, "") || "/");

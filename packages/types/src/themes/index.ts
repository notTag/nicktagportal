// Theme catalog now sourced from the shared package @nick_tag_tech/themes.
// This file is a thin re-export shim so existing `@ntypes/themes` consumers
// (shell + cli) keep working unchanged during migration. The local per-theme
// *.ts files are now orphaned and will be removed in a cleanup commit once a
// deploy confirms the shared package is wired correctly.
export { themes, themeList, DEFAULT_THEME_ID } from '@nick_tag_tech/themes'
export type { Theme, ThemeColors, ThemeId } from '@nick_tag_tech/themes'

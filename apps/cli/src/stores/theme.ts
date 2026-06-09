// Theme store provided by the shared package @nick_tag_tech/themes.
// createThemeStore preserves the prior contract: confirmed id + transient
// preview id, localStorage persistence (key 'nicksite-theme'), and the
// currentTheme/activeThemeId/confirmedThemeId computeds. Store id stays 'theme'.
import { createThemeStore } from '@nick_tag_tech/themes/pinia'

export const useThemeStore = createThemeStore({ storageKey: 'nicksite-theme' })

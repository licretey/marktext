import * as actions from '../actions/theme'
import { t } from '../../i18n'

export default function (userPreference) {
  const { theme, followSystemTheme } = userPreference.getAll()
  const isThemeSelectionEnabled = !followSystemTheme

  const submenu = [
    // Follow System Theme
    {
      label: t('preferences.theme.followSystemTheme'),
      type: 'checkbox',
      id: 'follow-system-theme',
      checked: followSystemTheme,
      click(menuItem, browserWindow) {
        actions.setFollowSystemTheme(menuItem.checked)
      }
    }
  ]

  if (!isThemeSelectionEnabled) {
    submenu.push({
      label: t('menu.theme.followThemDisabled'),
      enabled: false
    })
  }

  submenu.push(
    // Light Themes (alphabetical)
    {
      label: t('menu.theme.lightThemes'),
      enabled: false
    },
    {
      label: t('menu.theme.ayuLight'),
      type: 'checkbox',
      id: 'ayu-light',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'ayu-light',
      click(menuItem, browserWindow) {
        actions.selectTheme('ayu-light')
      }
    },
    {
      label: t('menu.theme.cadmiumLight'),
      type: 'checkbox',
      id: 'light',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'light',
      click(menuItem, browserWindow) {
        actions.selectTheme('light')
      }
    },
    {
      label: t('menu.theme.catppuccinLatte'),
      type: 'checkbox',
      id: 'catppuccin-latte',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'catppuccin-latte',
      click(menuItem, browserWindow) {
        actions.selectTheme('catppuccin-latte')
      }
    },
    {
      label: t('menu.theme.everforestLight'),
      type: 'checkbox',
      id: 'everforest-light',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'everforest-light',
      click(menuItem, browserWindow) {
        actions.selectTheme('everforest-light')
      }
    },
    {
      label: t('menu.theme.graphiteLight'),
      type: 'checkbox',
      id: 'graphite',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'graphite',
      click(menuItem, browserWindow) {
        actions.selectTheme('graphite')
      }
    },
    {
      label: t('menu.theme.gruvboxLight'),
      type: 'checkbox',
      id: 'gruvbox-light',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'gruvbox-light',
      click(menuItem, browserWindow) {
        actions.selectTheme('gruvbox-light')
      }
    },
    {
      label: t('menu.theme.rosePineDawn'),
      type: 'checkbox',
      id: 'rose-pine-dawn',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'rose-pine-dawn',
      click(menuItem, browserWindow) {
        actions.selectTheme('rose-pine-dawn')
      }
    },
    {
      label: t('menu.theme.solarizedLight'),
      type: 'checkbox',
      id: 'solarized-light',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'solarized-light',
      click(menuItem, browserWindow) {
        actions.selectTheme('solarized-light')
      }
    },
    {
      label: t('menu.theme.tokyoNightLight'),
      type: 'checkbox',
      id: 'tokyo-night-light',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'tokyo-night-light',
      click(menuItem, browserWindow) {
        actions.selectTheme('tokyo-night-light')
      }
    },
    {
      label: t('menu.theme.ulyssesLight'),
      type: 'checkbox',
      id: 'ulysses',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'ulysses',
      click(menuItem, browserWindow) {
        actions.selectTheme('ulysses')
      }
    },
    { type: 'separator' },
    // Dark Themes (alphabetical)
    {
      label: t('menu.theme.darkThemes'),
      enabled: false
    },
    {
      label: t('menu.theme.ayuDark'),
      type: 'checkbox',
      id: 'ayu-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'ayu-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('ayu-dark')
      }
    },
    {
      label: t('menu.theme.ayuMirage'),
      type: 'checkbox',
      id: 'ayu-mirage',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'ayu-mirage',
      click(menuItem, browserWindow) {
        actions.selectTheme('ayu-mirage')
      }
    },
    {
      label: t('menu.theme.cadmiumDark'),
      type: 'checkbox',
      id: 'dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('dark')
      }
    },
    {
      label: t('menu.theme.catppuccinMocha'),
      type: 'checkbox',
      id: 'catppuccin-mocha',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'catppuccin-mocha',
      click(menuItem, browserWindow) {
        actions.selectTheme('catppuccin-mocha')
      }
    },
    {
      label: t('menu.theme.cyberdream'),
      type: 'checkbox',
      id: 'cyberdream',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'cyberdream',
      click(menuItem, browserWindow) {
        actions.selectTheme('cyberdream')
      }
    },
    {
      label: t('menu.theme.dracula'),
      type: 'checkbox',
      id: 'dracula',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'dracula',
      click(menuItem, browserWindow) {
        actions.selectTheme('dracula')
      }
    },
    {
      label: t('menu.theme.everforestDark'),
      type: 'checkbox',
      id: 'everforest-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'everforest-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('everforest-dark')
      }
    },
    {
      label: t('menu.theme.gruvboxDark'),
      type: 'checkbox',
      id: 'gruvbox-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'gruvbox-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('gruvbox-dark')
      }
    },
    {
      label: t('menu.theme.horizonDark'),
      type: 'checkbox',
      id: 'horizon-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'horizon-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('horizon-dark')
      }
    },
    {
      label: t('menu.theme.kanagawa'),
      type: 'checkbox',
      id: 'kanagawa',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'kanagawa',
      click(menuItem, browserWindow) {
        actions.selectTheme('kanagawa')
      }
    },
    {
      label: t('menu.theme.materialDark'),
      type: 'checkbox',
      id: 'material-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'material-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('material-dark')
      }
    },
    {
      label: t('menu.theme.monokaiPro'),
      type: 'checkbox',
      id: 'monokai-pro',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'monokai-pro',
      click(menuItem, browserWindow) {
        actions.selectTheme('monokai-pro')
      }
    },
    {
      label: t('menu.theme.nightfox'),
      type: 'checkbox',
      id: 'nightfox',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'nightfox',
      click(menuItem, browserWindow) {
        actions.selectTheme('nightfox')
      }
    },
    {
      label: t('menu.theme.nord'),
      type: 'checkbox',
      id: 'nord',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'nord',
      click(menuItem, browserWindow) {
        actions.selectTheme('nord')
      }
    },
    {
      label: t('menu.theme.oneDark'),
      type: 'checkbox',
      id: 'one-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'one-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('one-dark')
      }
    },
    {
      label: t('menu.theme.oxocarbonDark'),
      type: 'checkbox',
      id: 'oxocarbon-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'oxocarbon-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('oxocarbon-dark')
      }
    },
    {
      label: t('menu.theme.palenight'),
      type: 'checkbox',
      id: 'palenight',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'palenight',
      click(menuItem, browserWindow) {
        actions.selectTheme('palenight')
      }
    },
    {
      label: t('menu.theme.rosePine'),
      type: 'checkbox',
      id: 'rose-pine',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'rose-pine',
      click(menuItem, browserWindow) {
        actions.selectTheme('rose-pine')
      }
    },
    {
      label: t('menu.theme.rosePineMoon'),
      type: 'checkbox',
      id: 'rose-pine-moon',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'rose-pine-moon',
      click(menuItem, browserWindow) {
        actions.selectTheme('rose-pine-moon')
      }
    },
    {
      label: t('menu.theme.solarizedDark'),
      type: 'checkbox',
      id: 'solarized-dark',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'solarized-dark',
      click(menuItem, browserWindow) {
        actions.selectTheme('solarized-dark')
      }
    },
    {
      label: t('menu.theme.synthwave84'),
      type: 'checkbox',
      id: 'synthwave-84',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'synthwave-84',
      click(menuItem, browserWindow) {
        actions.selectTheme('synthwave-84')
      }
    },
    {
      label: t('menu.theme.tokyoNight'),
      type: 'checkbox',
      id: 'tokyo-night',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'tokyo-night',
      click(menuItem, browserWindow) {
        actions.selectTheme('tokyo-night')
      }
    },
    {
      label: t('menu.theme.tokyoNightStorm'),
      type: 'checkbox',
      id: 'tokyo-night-storm',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'tokyo-night-storm',
      click(menuItem, browserWindow) {
        actions.selectTheme('tokyo-night-storm')
      }
    }
  )
  return {
    label: t('menu.theme.theme'),
    id: 'themeMenu',
    submenu
  }
}

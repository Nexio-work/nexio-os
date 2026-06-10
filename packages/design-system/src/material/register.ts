/**
 * Material Web components re-export
 * Import this once to register all custom elements used by Nexio OS.
 *
 * Usage (in +layout.svelte):
 *   import '@nexio/design-system/material/register';
 *
 * Then use in templates:
 *   <md-filled-button>Click</md-filled-button>
 *   <md-elevated-card>Card content</md-elevated-card>
 */

// Core interactive
export { MdFilledButton } from '@material/web/button/filled-button.js';
export { MdOutlinedButton } from '@material/web/button/outlined-button.js';
export { MdTextButton } from '@material/web/button/text-button.js';
export { MdIconButton } from '@material/web/iconbutton/icon-button.js';
export { MdFab } from '@material/web/fab/fab.js';

// Selection / Input
export { MdSwitch } from '@material/web/switch/switch.js';
export { MdCheckbox } from '@material/web/checkbox/checkbox.js';
export { MdRadio } from '@material/web/radio/radio.js';
export { MdTextField } from '@material/web/textfield/text-field.js';
export { MdFilledTextField } from '@material/web/textfield/filled-text-field.js';
export { MdSelect } from '@material/web/select/select.js';
export { MdSlider } from '@material/web/slider/slider.js';

// Display / Surface
export { MdElevatedCard } from '@material/web/card/elevated-card.js';
export { MdFilledCard } from '@material/web/card/filled-card.js';
export { MdOutlinedCard } from '@material/web/card/outlined-card.js';
export { MdDivider } from '@material/web/divider/divider.js';
export { MdLinearProgress } from '@material/web/progress/linear-progress.js';
export { MdCircularProgress } from '@material/web/progress/circular-progress.js';
export { MdIcon } from '@material/web/icon/icon.js';
export { MdRipple } from '@material/web/ripple/ripple.js';

// Navigation
export { MdTabs } from '@material/web/tabs/tabs.js';
export { MdTab } from '@material/web/tab/tab.js';
export { MdNavigationBar } from '@material/web/navigationbar/navigation-bar.js';
export { MdNavigationTab } from '@material/web/navigationtab/navigation-tab.js';

// Feedback
export { MdDialog } from '@material/web/dialog/dialog.js';
export { MdMenu } from '@material/web/menu/menu.js';
export { MdMenuItem } from '@material/web/menu/menu-item.js';
export { MdChipSet } from '@material/web/chips/chip-set.js';
export { MdFilterChip } from '@material/web/chips/filter-chip.js';
export { MdSuggestionChip } from '@material/web/chips/suggestion-chip.js';
export { MdInputChip } from '@material/web/chips/input-chip.js';
export { MdList } from '@material/web/list/list.js';
export { MdListItem } from '@material/web/list/list-item.js';
export { MdSnackbar } from '@material/web/snackbar/snackbar.js';
export { MdTooltip } from '@material/web/tooltip/tooltip.js';

// Layout
export { MdElevation } from '@material/web/elevation/elevation.js';

// Side panel
export { MdSideSheet } from '@material/web/sidesheet/side-sheet.js';

# Testing Strategy for i18n and Theme Functionality

This document outlines the testing strategy for ensuring the correct implementation of internationalization (i18n) and theme (light/dark mode) features.

## I. Internationalization (i18n) Testing

### 1. Language Switching and Content Verification:
   - **Objective:** Ensure that language can be switched and that UI text updates accordingly.
   - **Test Cases:**
     - Navigate to a page (e.g., Homepage, Dashboard).
     - Use the Language Switcher to change from English to Traditional Chinese.
     - **Expected Result:** All relevant text on the page (headings, buttons, labels, navbar items, Joyride tutorial steps) should update to Traditional Chinese.
     - Use the Language Switcher to change back to English.
     - **Expected Result:** All relevant text should revert to English.
     - Verify that the locale in the URL path changes correctly (e.g., `/en/page` to `/zh-TW/page`).
     - Test on multiple key pages to ensure broad coverage.

### 2. Translation Completeness (Manual Audit):
   - **Objective:** Ensure all user-facing strings are translated.
   - **Process:**
     - Switch to each supported language (English, Traditional Chinese).
     - Navigate through all pages and UI components.
     - **Expected Result:** Identify any text that remains untranslated or displays incorrectly. These should be reported and fixed by adding appropriate keys to the `locales/*.json` files.

### 3. Fallback Language:
   - **Objective:** Ensure that if a translation key is missing for a specific language, it gracefully falls back (e.g., to the key itself or to the default language).
   - **Test Case (Simulated):**
     - Temporarily remove a known translation from `zh-TW.json` but keep it in `en.json`.
     - Switch to Traditional Chinese.
     - **Expected Result:** The UI should display the English text (if English is the fallback) or the translation key for that specific string, rather than crashing or showing a blank space. (The current `useTranslation` hook returns the key if not found).

### 4. Persistence of Language Preference:
   - **Objective:** Next.js i18n routing primarily relies on the URL for locale. Ensure that navigating via links maintains the chosen locale.
   - **Test Case:**
     - Select Traditional Chinese.
     - Navigate to different pages using internal links.
     - **Expected Result:** The language should remain Traditional Chinese, and the URL prefix should persist.

## II. Theme (Light/Dark Mode) Testing

### 1. Theme Toggling and Style Verification:
   - **Objective:** Ensure that the theme can be toggled and that UI styles update correctly.
   - **Test Cases:**
     - Navigate to a page (e.g., Homepage, Dashboard).
     - Use the Theme Toggler to switch from Light to Dark mode.
     - **Expected Result:**
       - Background colors should change (e.g., body, cards, navbars).
       - Text colors should adjust for readability.
       - Icons and buttons should adapt their appearance.
       - The `.dark` class should be applied to the `<html>` element.
     - Use the Theme Toggler to switch back to Light mode.
     - **Expected Result:** Styles should revert to the light theme, and the `.dark` class should be removed from `<html>`.
     - Test on multiple key pages.

### 2. Style Consistency:
   - **Objective:** Ensure visual consistency and readability in both themes.
   - **Process:**
     - Switch between light and dark modes on various pages.
     - **Expected Result:** Check for any elements that are hard to see, have poor contrast, or don't match the overall theme. Tailwind `dark:` variants should be used to fix these.

### 3. Persistence of Theme Preference:
   - **Objective:** Ensure the selected theme persists across sessions.
   - **Test Cases:**
     - Select Dark mode.
     - Close the browser tab/window and reopen the application.
     - **Expected Result:** The application should load in Dark mode (verify `localStorage` has `theme: 'dark'`).
     - Select Light mode.
     - Refresh the page.
     - **Expected Result:** The application should remain in Light mode.

### 4. System Preference (Optional Initial Load):
   - **Objective:** If implemented, verify that the application respects the system's preferred color scheme on the first load when no theme is stored in `localStorage`. (The current implementation defaults to 'light' if nothing is stored, but this is a point for future consideration).

## III. Combined i18n and Theme Testing

- **Objective:** Ensure that both functionalities work well together.
- **Test Cases:**
  - Switch to Traditional Chinese and Dark mode.
  - Navigate through the application.
  - **Expected Result:** All translations should be correct, and all dark theme styles should be applied correctly.
  - Repeat for other combinations (e.g., English/Dark, Chinese/Light).

This testing strategy should be revisited and updated as new features or components are added.

## IV. Comprehensive Coverage for Audited Components

Following the extensive audit and refactoring process, it's crucial to ensure comprehensive test coverage across all modified areas of the application. Testers should:

-   **Verify All Refactored Pages and Components:** Systematically go through every page and component that was part of the i18n and theme audit. This includes, but is not limited to:
    -   All sections under `/dashboard` (home, chat, deck management, OCR, preview, search, settings, speed review).
    -   Static informational pages (`/info/about`, `/info/privacy`, `/info/tos`).
    -   Functional pages like `/download`, `/market`, `/share`, `/tempword`.
    -   Core reusable components (`card.tsx`, `deck.tsx`, `list.tsx`, `questions.tsx`, `question_word.tsx`, `spell.tsx`, various form components, etc.).
-   **Test Form Elements Thoroughly:** For all forms (e.g., login, deck creation, card editing, settings), verify that all labels, input placeholders, select options, and submit buttons are correctly translated and adapt to themes.
-   **Check Dynamic Content and UI States:** In components that display dynamic content or have multiple states (e.g., loading data, empty/no results, displaying content like flashcards or lists, interactive exercises), ensure that text associated with each state is translated and themed correctly.
-   **Verify Alert Messages:** Where possible to trigger, check that any user-facing alert messages are translated.
-   **Confirm Joyride Tutorial Translations:** For all instances of Joyride tutorials (e.g., in dashboard layout, preview pages), ensure all step content is accurately translated and displays correctly in both light and dark themes.

This diligence will help confirm the completeness and quality of the internationalization and theming efforts.

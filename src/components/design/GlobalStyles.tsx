// src/components/design/GlobalStyles.tsx
import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyles = createGlobalStyle`
  /* 1. CSS Reset inspired by Andy Bell’s modern-normalize */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* 2. Root-level theme variables */
  :root {
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-bg: ${theme.colors.background};
    --color-text: ${theme.colors.text};

    --font-base: ${theme.typography.fontFamily};
    --fs-sm: ${theme.typography.fontSize.sm};
    --fs-base: ${theme.typography.fontSize.base};
    --fs-lg: ${theme.typography.fontSize.lg};
    --fs-xl: ${theme.typography.fontSize.xl};

    --fw-normal: ${theme.typography.fontWeight.normal};
    --fw-medium: ${theme.typography.fontWeight.medium};
    --fw-bold: ${theme.typography.fontWeight.bold};

    --space-xs: ${theme.spacing.xs};
    --space-sm: ${theme.spacing.sm};
    --space-md: ${theme.spacing.md};
    --space-lg: ${theme.spacing.lg};
    --space-xl: ${theme.spacing.xl};
  }

  /* 3. Base element styles */
  html {
    font-family: var(--font-base);
    font-size: var(--fs-base);
    background-color: var(--color-bg);
    color: var(--color-text);
    scroll-behavior: smooth;
  }

  /* Responsive font scaling */
  @media (max-width: 768px) {
    html {
      font-size: calc(var(--fs-base) * 0.9);
    }
  }
  @media (min-width: 1200px) {
    html {
      font-size: calc(var(--fs-base) * 1.1);
    }
  }

  body {
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* 4. Headings */
  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--fw-bold);
    color: var(--color-text);
    margin-bottom: var(--space-sm);
    line-height: 1.2;
  }

  h1 { font-size: var(--fs-xl); }
  h2 { font-size: var(--fs-lg); }
  h3 { font-size: var(--fs-base); }

  /* 5. Links & buttons */
  a {
    color: var(--color-primary);
    text-decoration: none;
  }
  a:hover,
  button:hover {
    opacity: 0.85;
  }
  button {
    font-family: inherit;
    background: none;
    border: none;
    cursor: pointer;
  }

  /* 6. Form elements */
  input, textarea, select {
    font: inherit;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: var(--space-sm);
    background: white;
    color: var(--color-text);
  }
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0, 85, 255, 0.2);
  }

  /* 7. Images & media */
  img, video {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 8. Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

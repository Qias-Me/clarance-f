---
type: "always_apply"
---

# Tailwind CSS Best Practices
VERSION: v4.1

## Project Setup
- Create a proper `tailwind.config.js` file with TypeScript types (`/** @type {import('tailwindcss').Config} */`)
- Extend the theme object using the `extend` key to preserve default values while adding custom ones
- Configure content paths precisely to include all template files (`content: ['./src/**/*.{js,jsx,ts,tsx}']`)
- Add necessary plugins with proper configuration (e.g., `@tailwindcss/forms`, `@tailwindcss/typography`)
- Define custom breakpoints in the `screens` object that match your design requirements
- Create a semantic color palette with consistent naming conventions and appropriate shade variations

## Component Styling
- Prioritize Tailwind utility classes over custom CSS classes or inline styles
- Use `@apply` directive in CSS files only for frequently repeated utility combinations
- Apply responsive utilities with breakpoint prefixes (e.g., `md:flex-row`)
- Configure dark mode with `darkMode: 'class'` and use `dark:` variant consistently
- Utilize state variants like `hover:`, `focus:`, `active:` for interactive elements
- Maintain consistent spacing, sizing, and color patterns across similar components

## Layout
- Choose appropriate Flexbox (`flex`, `items-center`) or Grid (`grid`, `grid-cols-3`) utilities based on layout needs
- Use the spacing scale consistently (e.g., `p-4`, `my-2`, `gap-6`) throughout your application
- Implement container queries with `@container` for component-specific responsive behavior
- Apply responsive breakpoints systematically from mobile to desktop (`sm:`, `md:`, `lg:`, `xl:`)
- Use directional padding/margin utilities precisely (`pt-4`, `mb-2`) rather than shorthand when possible
- Align content with appropriate utilities (`justify-between`, `items-center`) rather than absolute positioning

## Typography
- Apply font size utilities from the type scale (`text-sm`, `text-lg`) consistently across similar elements
- Set appropriate line heights (`leading-tight`, `leading-relaxed`) based on text density and purpose
- Use font weight utilities (`font-bold`, `font-medium`) that match your design system's hierarchy
- Configure custom fonts in `tailwind.config.js` with proper fallbacks (`fontFamily: { sans: ['Inter', 'sans-serif'] }`)
- Apply text alignment utilities (`text-left`, `text-center`) based on content context and language direction
- Use text decoration utilities (`underline`, `line-through`) purposefully and consistently

## Colors
- Name colors semantically in your theme (`primary`, `secondary`, `error`) rather than descriptively (`blue`, `red`)
- Ensure sufficient contrast ratios between text and background colors (WCAG AA minimum: 4.5:1 for normal text)
- Use opacity utilities (`bg-blue-500/50`, `text-opacity-80`) for visual hierarchy and overlay effects
- Define custom colors with complete shade ranges (50-900) in the `tailwind.config.js` file
- Apply gradient utilities consistently with appropriate direction and color stops
- Implement hover state colors that provide clear visual feedback while maintaining contrast requirements

## Components
- Utilize shadcn/ui components as building blocks for consistent UI elements
- Extend component variants through the `variants` API rather than overriding base styles
- Create and maintain a consistent component variant system across your application
- Implement animations sparingly with `animate-` utilities and custom keyframes when needed
- Apply transitions with appropriate duration and timing functions (`transition-all duration-300 ease-in-out`)
- Ensure all components meet WCAG 2.1 AA accessibility standards (focus states, color contrast, aria attributes)

## Responsive Design
- Start with mobile layouts first, then enhance for larger screens with breakpoint prefixes
- Define logical breakpoints based on content needs rather than specific devices
- Use container queries for component-specific responsive behavior that's independent of viewport
- Test layouts thoroughly across various screen sizes and orientations
- Scale typography responsively using size utilities with breakpoint prefixes (`text-base md:text-lg`)
- Adjust spacing proportionally across breakpoints to maintain visual hierarchy

## Performance
- Configure content paths precisely to minimize CSS bundle size
- Avoid unnecessary custom CSS that duplicates available utility classes
- Implement proper caching strategies with cache-control headers and versioned assets
- Use code splitting to load only the CSS needed for each page or component
- Enable minification for production builds with the `--minify` flag
- Monitor bundle size with tools like Webpack Bundle Analyzer or Lighthouse

## Best Practices
- Follow consistent naming conventions for custom utilities and components
- Organize styles logically with component-specific CSS modules when needed
- Document custom utilities, components, and theme extensions thoroughly
- Write tests for custom Tailwind plugins and complex component styling
- Follow WCAG 2.1 AA accessibility guidelines for all user interface elements
- Use version control effectively with meaningful commits for CSS changes
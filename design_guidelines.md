# Civic Engagement Platform Design Guidelines

## Design Approach

**Selected Framework**: Design System Approach (Material Design + USWDS principles)
- Civic platforms require trust, accessibility, and clarity
- Information-dense interface prioritizes function over aesthetics
- Draw from Material Design for component structure and USWDS for civic credibility

## Typography

**Font Stack**: 
- Primary: Inter or Public Sans (civic-friendly, highly readable)
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)

**Hierarchy**:
- Page Titles: text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base
- Metadata/Stats: text-sm
- Labels: text-xs font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent rhythm: p-4, gap-6, space-y-8
- Card padding: p-6
- Section spacing: py-12 or py-16
- Container max-width: max-w-7xl

**Grid System**:
- Dashboard: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Statistics panel: 3-column for metrics (grid-cols-3)
- Submission form: Single column max-w-2xl centered

## Component Library

### Navigation
- Fixed header with platform name and navigation links
- Height: h-16
- Logo/title on left, navigation center, CTA button right
- Mobile: Hamburger menu pattern

### Submission Form
- Three distinct sections with category indicators (🟢🔵🟡)
- Radio button selection for category type
- Text area for description (min-h-32)
- Input fields: full-width with labels above
- Time commitment field for volunteer offers (number input + unit selector)
- Submit button: Large, prominent (px-8 py-3 text-lg)

### Dashboard Cards
- Submission cards with category badge in top-left
- Card structure: rounded-lg border with p-6 spacing
- Header: Category badge + timestamp (text-xs)
- Content: Description (line-clamp-3 for overflow)
- Footer: Contact info (when provided) + relevant metadata
- Hover: subtle elevation increase (shadow-lg transition)

### Statistics Panel
- Prominent placement above dashboard grid
- Three metric cards in horizontal row
- Each card: Icon + number (text-3xl font-bold) + label
- "Citizen Hours" calculation highlighted as primary metric

### Filtering
- Horizontal tab navigation above dashboard
- Tabs: All, Needs, Offers, Ideas
- Active state: Bold text + bottom border indicator
- Count badges showing number per category

## Images

**Header Background**: 
- Subtle civic imagery (city skyline, community gathering, or abstract municipal pattern)
- Height: h-48 to h-64 (not full hero)
- Overlay gradient for text readability
- Position: Top of page, contains platform title and tagline

**No additional images needed** - Focus on clean, functional interface with iconography from Material Icons for:
- Category badges (problem icon, volunteer icon, lightbulb icon)
- Statistics icons (users, clock, calculator)
- Form field icons

## Accessibility Standards

- All form inputs: Proper label associations, aria-labels
- Color-coded categories: Include icons and text, not color alone
- Focus states: Visible ring-2 on all interactive elements
- Minimum touch targets: h-12 for buttons
- Semantic HTML: <main>, <nav>, <section>, <article> tags
- Skip navigation link for keyboard users

## Key Interactions

- Form validation: Inline error messages below fields
- Success state: Toast notification after submission + redirect to dashboard
- Loading states: Skeleton cards while fetching data
- Empty states: Encouraging message with call-to-action when no submissions
- Responsive: Mobile-first, stack columns on small screens

## Overall Visual Treatment

- Clean, professional, trustworthy
- Generous whitespace prevents overwhelming civic interface
- Clear hierarchy guides users to three primary actions
- Dashboard feels organized and scannable
- Statistics provide immediate value/impact feedback
- Form is approachable and quick to complete
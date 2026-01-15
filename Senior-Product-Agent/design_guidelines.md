# Design Guidelines: Investment Tracker MVP

## Design Approach
**Selected Approach:** Design System - Clean Data-Focused Interface
**Rationale:** This is a utility-focused financial tracking tool requiring clarity, efficiency, and data legibility. Drawing from Material Design principles and modern dashboard patterns (Linear, Stripe Dashboard) for clean, functional aesthetics.

## Typography System
- **Primary Font:** Inter or System UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)
- **Hierarchy:**
  - Page Title: 32px, weight 700
  - Section Headers: 24px, weight 600
  - Card Titles: 18px, weight 600
  - Body Text: 16px, weight 400
  - Labels: 14px, weight 500
  - Table Data: 15px, weight 400 (numbers), 14px (text)
  - Small Text/Metadata: 13px, weight 400

## Layout System
**Spacing Units:** Use consistent 8px-based spacing (8px, 16px, 24px, 32px, 48px, 64px)
- Container max-width: 1200px, centered
- Page padding: 24px mobile, 48px desktop
- Section spacing: 48px vertical
- Card padding: 24px
- Form field spacing: 16px between fields

## Component Library

### Dashboard Layout
- Full-width header with title "Mi Inversión"
- Three-column summary cards for key metrics (stack on mobile):
  - Total USD Aportado
  - Total ARS Aportado  
  - Benchmark Comparison
- Transaction form section with clear visual separation
- Transaction list/table below

### Summary Cards
- Slightly elevated appearance (subtle shadow)
- Rounded corners (8px)
- Padding: 24px
- Metric label above large number display
- Number size: 36px, weight 700
- Secondary info: 14px below main number

### Forms
- Clean, single-column layout
- Field groups with clear labels above inputs
- Input height: 44px (good touch target)
- Border radius: 6px
- Spacing between fields: 16px
- Conditional fields (FX options) slide in smoothly
- Submit button: Full width on mobile, auto-width on desktop
- Button height: 44px, padding: 12px 24px, border-radius: 6px

### Transaction List
- Table layout on desktop (columns: Date, Type, Currency, Amount, USD Equiv, Note, Actions)
- Card layout on mobile (stacked information)
- Alternating row treatment for readability
- Clear visual distinction between APORTE and COBRO types
- Action buttons (Edit, Delete) aligned right
- Empty state: Centered message with icon

### Benchmark Section
- Distinct visual container
- Editable rate field inline with label
- Three-column comparison (mobile: stack):
  - Total Invertido
  - Valor S&P500 (hipotético)
  - Diferencia (with indicator showing positive/negative)

### Status/Warning Messages
- Demo mode warning: Prominent banner at top with icon
- Error states: Inline below relevant fields
- Success feedback: Subtle confirmation message

## Visual Hierarchy
- Use size, weight, and spacing to create clear hierarchy
- Important numbers: Large, bold
- Supporting text: Smaller, medium weight
- Metadata/labels: Smaller, lighter weight

## Interactions (Minimal)
- Hover states: Subtle (slight opacity change or underline)
- Focus states: Clear outline for accessibility
- Form validation: Real-time feedback below fields
- Loading states: Simple spinner or skeleton for async operations
- Avoid complex animations

## Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

## Accessibility
- Semantic HTML throughout
- ARIA labels for icons and actions
- Sufficient contrast for all text
- Keyboard navigation support
- Form labels properly associated

## Spanish Language Considerations
- Ample space for longer Spanish labels
- Date format: DD/MM/YYYY
- Currency format: $ 1.234,56 (ARS), USD 1,234.56
- Clear contextual help text in Spanish

This design prioritizes **clarity, data legibility, and efficient task completion** over decorative elements, aligning with the MVP's functional nature.
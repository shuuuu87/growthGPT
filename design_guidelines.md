# Growth GPT Design Guidelines

## Design Philosophy
Growth GPT should feel like a supportive study partner, not just a tracking tool. The interface combines minimal aesthetics with motivational elements to inspire consistent student engagement and healthy competition.

## Design Approach
**Reference-Based Approach**: Drawing inspiration from:
- **Duolingo**: Gamification, streak mechanics, and motivational design patterns
- **Linear**: Clean minimalism, smooth animations, precise typography
- **Notion**: Card-based layouts and comfortable information density

## Color Palette
- **Primary Blue**: Use for CTAs, active states, progress indicators, and streak badges
- **White**: Primary background and card surfaces
- **Light Gray**: (#F7F9FC - #E5E7EB range) for subtle backgrounds, borders, and secondary text
- **Success Green**: For completed goals and positive feedback
- **Accent Colors**: Soft gold/yellow for streak flames, confetti celebrations

## Typography
**Font Family**: Inter or DM Sans from Google Fonts
- **Headings**: 
  - H1: 2.5rem (40px), font-weight 700, tight letter-spacing
  - H2: 1.875rem (30px), font-weight 600
  - H3: 1.5rem (24px), font-weight 600
- **Body Text**: 1rem (16px), font-weight 400-500
- **Small Text**: 0.875rem (14px) for labels and metadata
- **Numbers/Stats**: Font-weight 700, slightly larger sizing for emphasis

## Layout System
**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6 to p-8
- Card spacing: gap-6 between cards
- Section margins: my-12 to my-20
- Container: max-w-7xl with px-6 for content breathing room

## Component Library

### Authentication Pages (Login/Register)
- **Layout**: Centered card (max-w-md) on soft gradient background
- **Card Design**: White surface, rounded-2xl (16px radius), shadow-xl
- **Form Fields**: 
  - Full-width inputs with rounded-lg borders
  - Focus state: blue ring with slight scale transform
  - Generous padding (p-3) for touch-friendly interaction
- **Primary Button**: Full-width, rounded-lg, blue background with white text, py-3
- **Secondary Actions**: Text links in gray, hover to blue transition
- **Divider**: "OR" text centered with horizontal lines on sides
- **Google Button**: White background, border, Google icon + text, rounded-lg

### Dashboard
**Three-Column Layout** (on desktop):
1. **Left Sidebar** (w-64): 
   - Navigation menu with icons
   - User profile snippet at top
   - Sticky positioning
   
2. **Main Content Area** (flex-1):
   - **Study Sessions Card**: 
     - Header with "Add Session" button (blue, rounded-lg)
     - Session list items: rounded-lg cards with topic name, subject badge, time estimate
     - "Mark Complete" button triggers quiz modal
   
   - **7-Day Chart Card**:
     - Dual-axis bar chart (Recharts)
     - Blue bars for scores, light gray for study time
     - Rounded-lg card container with p-6
     - Subtle grid lines, clean axis labels
   
3. **Right Sidebar** (w-80):
   - **Streak Counter**: 
     - Large number display (4rem, font-weight 800)
     - Flame icon (🔥 or SVG) next to count
     - Subtitle: "day streak" in gray
     - Gradient background (blue to light blue)
     - Rounded-2xl with p-8
   
   - **Goal Calendar**:
     - Mini calendar grid (7×5)
     - Checkable day cells with hover states
     - Completed days: blue background with checkmark
     - Current day: blue ring outline
     - Goal completion triggers confetti animation (canvas-confetti library)

### Quiz Modal
- **Overlay**: Semi-transparent dark background (backdrop-blur-sm)
- **Modal Card**: 
  - max-w-2xl, centered, white background, rounded-2xl
  - Question text: text-xl, font-semibold, mb-6
  - **MCQ Options**: 
    - Radio button cards: rounded-lg, p-4, border-2
    - Hover state: border-blue-400, bg-blue-50
    - Selected: border-blue-600, bg-blue-100
  - **Submit Button**: Primary blue button at bottom
  - **Results View**: 
    - Score display: Large number (3rem) with percentage
    - Correct/incorrect breakdown with icons
    - Encouraging message based on score
    - "Continue" button to close

### People/Leaderboard Page
- **Header Section**: 
  - Page title (H1) with trophy icon
  - Search bar (if many users): rounded-full, light gray background
  
- **Leaderboard Table**:
  - Rank column: Bold numbers with top 3 getting medal icons (🥇🥈🥉)
  - User column: Avatar (circular, w-10 h-10) + username
  - Score column: Bold blue numbers
  - Streak column: Flame icon + count
  - **Alternating row backgrounds**: White and very light gray (#FAFBFC)
  - Hover state: Subtle scale (1.01) and shadow increase
  - Rounded-lg on entire table container

- **User Profile Modal**: 
  - Triggered on username click
  - Shows 7-day mini chart for that user
  - No personal data, just progress visualization
  - Close button (X) in top-right

## Visual Effects & Animations

**Transitions**: 200ms ease-in-out for all interactive elements

**Micro-interactions**:
- Button hover: Slight scale (1.02) + shadow increase
- Card hover: Shadow deepens, subtle lift (translateY(-2px))
- Completed checkbox: Scale animation (0.8 → 1.2 → 1) with green checkmark fade-in
- Confetti: Burst from center for goal completions (duration: 3s)

**Loading States**: 
- Skeleton screens with animated gradient shimmer (light gray to white)
- Blue spinner for async operations

## Card Design System
All cards follow consistent pattern:
- Background: White (#FFFFFF)
- Border: None (use shadow instead)
- Border-radius: rounded-xl (12px) or rounded-2xl (16px)
- Shadow: shadow-md default, shadow-lg on hover
- Padding: p-6 standard, p-8 for feature cards

## Responsive Behavior
- **Desktop** (lg:): Three-column dashboard layout
- **Tablet** (md:): Two-column (main + one sidebar)
- **Mobile** (base): Single column, stack all elements
  - Bottom navigation bar for main sections
  - Chart becomes scrollable/compact version
  - Calendar uses swipe gestures for month navigation

## Motivational Elements
- **Empty States**: Friendly illustrations with encouraging copy ("Start your first study session!")
- **Achievement Badges**: Display when milestones reached (7-day streak, 100 total score, etc.)
- **Progress Indicators**: Circular progress rings for daily goals
- **Positive Reinforcement**: Success messages with celebratory language and emojis

## Images
No hero images required for this application. Focus remains on data visualization, cards, and functional UI elements. Use icon libraries (Heroicons or Lucide) for all iconography needs.
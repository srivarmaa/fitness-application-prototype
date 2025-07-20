# FitAI Pro - Prototype

## 🎨 Design System Implementation

This prototype implements a comprehensive design system with strict adherence to the provided theming structure. The application follows modern UI/UX principles with a focus on:

- **Dark theme** as primary design language
- **Grid-based layouts** for responsive design
- **JSON-driven theming** for user customization
- **Component-based architecture** for modularity

## 📁 Project Structure

```
prototype/
├── index.html              # Main application layout
├── styles.css              # Complete CSS design system
├── script.js               # Application logic with theme management
├── README.md                # This documentation
├── JSON_DATA_STRUCTURE.md   # Data architecture documentation
├── themes/                  # Theme configuration files
│   ├── dark-theme.json      # Dark theme (primary)
│   └── light-theme.json     # Light theme (alternative)
└── data/                    # Application data modules
    ├── user-data.json       # User profile, stats, achievements
    ├── workout-data.json     # Training modes, exercises, history
    ├── nutrition-data.json   # Food database, meal plans, tracking
    ├── wellness-data.json    # Mood, sleep, HRV, mindfulness
    ├── social-data.json     # Community, challenges, friends
    ├── coach-data.json      # Trainer info, collaboration
    ├── progress-data.json   # Charts, measurements, analytics
    └── planner-data.json    # Schedules, recommendations
```

## 🎨 Theme System

### JSON-Based Theming
Themes are defined in JSON files with the following structure:

```json
{
  "name": "Dark Theme",
  "id": "dark",
  "primaryThemeColors": {
    "background": "#000000",
    "foreground": "#e8e9e9",
    "primary": "#4693c6",
    "primaryForeground": "#ffffff"
  },
  "secondaryAccentColors": { ... },
  "uiComponentColors": { ... },
  "utilityFormColors": { ... },
  "statusFeedbackColors": { ... },
  "chartVisualizationColors": { ... },
  "sidebarNavigationColors": { ... },
  "gradients": { ... },
  "shadows": { ... },
  "spacing": { ... },
  "borderRadius": { ... },
  "typography": { ... },
  "animations": { ... }
}
```

### Theme Categories
1. **Primary Theme Colors** - Main background, foreground, and brand colors
2. **Secondary & Accent Colors** - Supporting color palette
3. **UI Component Colors** - Cards, popovers, muted elements
4. **Utility & Form Colors** - Borders, inputs, focus rings
5. **Status & Feedback Colors** - Error, success, warning states
6. **Chart & Visualization Colors** - Data visualization palette
7. **Sidebar & Navigation Colors** - Navigation-specific styling
8. **Gradients** - Predefined gradient combinations
9. **Shadows** - Layered shadow system
10. **Spacing** - Consistent spacing scale
11. **Border Radius** - Rounded corner system
12. **Typography** - Font families, sizes, weights
13. **Animations** - Timing and easing functions

## 🏗️ Grid Layout System

### App Structure
```css
.app-container {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 280px 1fr;
  grid-template-rows: 80px 1fr;
}
```

### Content Layouts
- **Dashboard Grid**: `repeat(auto-fit, minmax(320px, 1fr))`
- **Stats Grid**: `repeat(auto-fit, minmax(200px, 1fr))`
- **Training Modes**: `repeat(auto-fit, minmax(200px, 1fr))`
- **Planner Grid**: `repeat(7, 1fr)` (7-day week view)

### Responsive Breakpoints
- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🧩 Component System

### Card Components
All content uses a consistent card system:
```css
.card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-small);
}
```

### Button System
Comprehensive button variants:
- `.btn-primary` - Main actions
- `.btn-secondary` - Secondary actions
- `.btn-destructive` - Delete/remove actions
- `.btn-outline` - Outlined style
- `.btn-ghost` - Minimal style

### Form Components
Consistent form styling:
- `.form-input` - Text inputs
- `.form-select` - Dropdown selects
- `.form-textarea` - Text areas
- Focus states with ring system

## 🔧 JavaScript Architecture

### Theme Management
```javascript
class ThemeManager {
  async loadThemes()      // Load JSON theme files
  applyTheme(themeName)   // Apply theme to CSS variables
  toggleTheme()           // Switch between light/dark
}
```

### Data Loading
```javascript
async function loadAllData() {
  // Load all 8 JSON data modules in parallel
  // Handle errors gracefully
  // Initialize application after loading
}
```

### Application Structure
- **Modular data loading** from JSON files
- **Asynchronous initialization** with loading states
- **Error handling** with user notifications
- **Navigation system** with tab switching
- **Real-time updates** from data

## 🎯 Key Features

### 1. Strict Design Adherence
- Exact color palette implementation
- Consistent spacing and typography
- Grid-based responsive design
- Modern card-based UI

### 2. User Customization
- JSON-based theme switching
- Persistent theme preferences
- Easy theme modification
- Future custom theme support

### 3. Performance
- Parallel data loading
- CSS custom properties for theming
- Optimized grid layouts
- Smooth animations

### 4. Maintainability
- Modular JSON data structure
- Separate theme files
- Component-based CSS
- Clear naming conventions

## 🚀 Getting Started

1. **Serve the application**:
   ```bash
   cd prototype
   python -m http.server 8000
   # or
   npx serve .
   ```

2. **Open in browser**:
   ```
   http://localhost:8000
   ```

3. **Test theme switching**:
   - Click the moon/sun icon in header
   - Themes persist across sessions

4. **Verify data loading**:
   - Open browser console
   - Run `FitAI.testDataLoading()`

## 🎨 Customization

### Adding New Themes
1. Create new JSON file in `themes/` directory
2. Follow existing theme structure
3. Add theme to ThemeManager.loadThemes()
4. Theme automatically available

### Modifying Colors
1. Edit theme JSON files directly
2. Changes apply immediately on reload
3. CSS variables automatically updated
4. All components inherit changes

### Layout Adjustments
1. Modify grid templates in CSS
2. Adjust breakpoints as needed
3. Update spacing variables
4. Grid system adapts automatically

## 🔍 Development Notes

### CSS Variables
All theming uses CSS custom properties:
```css
:root {
  --background: #000000;
  --primary: #4693c6;
  /* Applied from JSON automatically */
}
```

### Responsive Design
Mobile-first approach with progressive enhancement:
```css
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

### Component Naming
Consistent BEM-inspired naming:
- `.card` - Base component
- `.card-header` - Component part
- `.card-title` - Element
- `.card.active` - State modifier

## 📊 Performance Considerations

- **Critical CSS**: Core styles loaded immediately
- **Lazy Loading**: Tab content loaded on demand
- **Efficient Grid**: Auto-sizing with minmax()
- **Smooth Animations**: Hardware-accelerated transforms
- **Minimal Reflows**: CSS custom properties for theming

## 🔮 Future Enhancements

1. **Advanced Theming**
   - Custom color picker
   - Theme export/import
   - Gradient customization

2. **Layout Options**
   - Sidebar toggle
   - Card size preferences
   - Grid density options

3. **Accessibility**
   - High contrast themes
   - Reduced motion preferences
   - Screen reader optimizations

---

**Built with strict adherence to the provided design system** ✨ 
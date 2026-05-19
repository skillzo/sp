# Responsive Design Migration Guide

## ✅ Pages Already Updated with Full Responsive Architecture

1. **Game.tsx** (Color Prediction) - ✅ COMPLETE
2. **Dashboard.tsx** - ✅ COMPLETE

## 🎯 Responsive Design Patterns

### 1. Container Structure
Replace fixed padding with clamp():
```tsx
// OLD:
<div className="px-4 pb-20 max-w-2xl mx-auto">

// NEW:
<div className="w-full mx-auto" style={{ 
  maxWidth: '640px',
  paddingLeft: 'clamp(12px, 4vw, 24px)',
  paddingRight: 'clamp(12px, 4vw, 24px)',
  paddingBottom: '5rem'
}}>
```

### 2. Responsive Typography
Use clamp() for font sizes:
```tsx
// OLD:
<h1 className="text-2xl font-bold">

// NEW:
<h1 className="font-bold" style={{ 
  fontSize: 'clamp(1.5rem, 5vw, 2rem)' 
}}>
```

### 3. Responsive Spacing
Use clamp() for gaps and padding:
```tsx
// OLD:
<div className="flex gap-4 p-4">

// NEW:
<div className="flex" style={{ 
  gap: 'clamp(8px, 2vw, 12px)',
  padding: 'clamp(12px, 3vw, 16px)'
}}>
```

### 4. Grid Layouts
Maintain responsive grids:
```tsx
// OLD:
<div className="grid grid-cols-3 gap-3">

// NEW:
<div className="grid grid-cols-3" style={{ 
  gap: 'clamp(6px, 2vw, 12px)' 
}}>
```

### 5. Buttons
Add responsive padding and active states:
```tsx
// OLD:
<button className="px-6 py-3 rounded-lg">

// NEW:
<button className="rounded-lg active:scale-95 transition-all" style={{ 
  padding: 'clamp(8px, 2.5vw, 12px) clamp(14px, 4vw, 24px)',
  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
}}>
```

### 6. Overflow Prevention
Always add these classes:
```tsx
// Container:
<div className="w-full overflow-x-hidden">

// Flex children:
<div className="flex-1 min-w-0">

// Text that might overflow:
<p className="truncate">

// Long strings:
<p className="break-all">
```

### 7. Touch Targets
Ensure minimum size:
```tsx
// Icons and buttons:
style={{ 
  width: 'clamp(20px, 5vw, 24px)',
  height: 'clamp(20px, 5vw, 24px)'
}}
```

### 8. SVG Responsiveness
Make SVG scale properly:
```tsx
<svg width="100%" height="100%" viewBox="0 0 400 400" 
     style={{ display: 'block' }}>
```

### 9. Aspect Ratios
Use aspect-ratio for circles/squares:
```css
.game-wheel {
  width: min(380px, 88vw);
  aspect-ratio: 1;
}
```

### 10. Flexbox Best Practices
```tsx
// Full-width flex container:
<div className="flex items-center justify-between w-full" style={{ 
  gap: 'clamp(8px, 2vw, 12px)' 
}}>

// Shrink-0 for icons:
<Icon className="shrink-0" />

// Flex-1 for text:
<div className="flex-1 min-w-0">
  <p className="truncate">Long text...</p>
</div>
```

## 📱 Mobile Breakpoints

Use these media queries in CSS:

```css
/* Small phones (Galaxy S8, iPhone SE) */
@media (max-width: 360px) {
  .game-wheel { width: min(320px, 84vw); }
}

/* Standard phones (iPhone 12/13/14) */
@media (max-width: 390px) {
  .game-wheel { width: min(340px, 86vw); }
}

/* Large phones (iPhone 14 Pro Max) */
@media (max-width: 428px) {
  .game-wheel { width: min(380px, 88vw); }
}
```

## 🎨 CSS Utility Classes

Use the new responsive utilities from `/src/styles/responsive.css`:

```tsx
// Container:
<div className="responsive-container">

// Cards:
<div className="responsive-card">

// Buttons:
<button className="responsive-button">

// Typography:
<p className="responsive-text-sm">

// Spacing:
<div className="responsive-gap-md responsive-padding-md">

// Grid:
<div className="grid-responsive-3">
```

## 🔧 Quick Migration Checklist

For each page, ensure:

- [ ] Root div has `w-full overflow-x-hidden`
- [ ] Container uses `clamp()` for padding
- [ ] All fixed `px-4`, `py-3` replaced with `clamp()`
- [ ] Typography uses `clamp()` for font-size
- [ ] Buttons have `active:scale-95` and responsive padding
- [ ] Flex containers have `w-full` and `gap: clamp()`
- [ ] Text elements have `truncate` or `break-all` where needed
- [ ] Icons have `shrink-0`
- [ ] Long content has `min-w-0` and `flex-1`
- [ ] SVGs have `display: block` and proper viewBox
- [ ] No absolute positioning (except for specific UI elements)
- [ ] All cards use flexbox/grid, not fixed widths

## 🌐 Cross-Browser Testing

Ensure these work:
- ✅ Chrome/Edge (latest)
- ✅ Safari iOS (12+)
- ✅ Firefox Mobile
- ✅ Opera Mini
- ✅ Samsung Internet

## 📊 Pages Status

### High Priority (Game-related)
- ✅ Game.tsx (Color Prediction)
- ⏳ DicePool.tsx
- ⏳ CrashGame.tsx
- ⏳ WheelGame.tsx

### Medium Priority (Core Features)
- ✅ Dashboard.tsx
- ⏳ Wallet.tsx
- ⏳ Profile.tsx
- ⏳ Notifications.tsx

### Lower Priority (Secondary Features)
- ⏳ DailyRebate.tsx
- ⏳ Upgrade.tsx
- ⏳ Referrals.tsx
- ⏳ Settings.tsx
- ⏳ Leaderboard.tsx

## 💡 Pro Tips

1. **Always test on real devices** - Simulators don't show all issues
2. **Use Chrome DevTools** - Toggle device toolbar and test multiple sizes
3. **Check landscape mode** - Some phones have different behavior
4. **Test with slow connections** - Images/fonts should load gracefully
5. **Verify safe areas** - Notches and home indicators need padding
6. **Check text wrapping** - Long words should break properly
7. **Touch targets** - Minimum 44x44px for buttons
8. **Avoid viewport units alone** - Always combine with min/max
9. **Test overflow** - Horizontal scroll should never happen
10. **Performance** - Use `will-change` sparingly

## 🚀 Implementation Priority

Apply responsive design in this order:
1. Game pages (highest traffic)
2. Dashboard and Wallet (core functionality)
3. Profile and settings
4. Secondary features

This ensures critical user paths work flawlessly on all devices first!

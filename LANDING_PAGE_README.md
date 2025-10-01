# 🚀 Reputraq Landing Page

A stunning, modern SaaS landing page built with Next.js, Framer Motion, and Aceternity UI components.

## ✨ Features

### 🎨 **Modern Design**
- **Dark theme** with gradient accents
- **Glassmorphism effects** with backdrop blur
- **Responsive design** that works on all devices
- **Professional typography** with custom fonts

### 🎭 **Smooth Animations**
- **Framer Motion** for fluid animations
- **Scroll-triggered animations** for engagement
- **Hover effects** and micro-interactions
- **Staggered animations** for visual appeal

### 🧩 **Aceternity UI Components**
- **Spotlight** - Hero section background effect
- **TextGenerateEffect** - Animated text reveal
- **LampContainer** - Call-to-action section
- **GridBackground** - Subtle grid pattern
- **FloatingNav** - Smooth navigation bar

### 📱 **Sections Included**

#### 🏠 **Hero Section**
- Animated headline with gradient text
- Text generation effect
- Call-to-action buttons
- Spotlight background effect

#### ⚡ **Features Section**
- 6 feature cards with icons
- Hover animations
- Gradient backgrounds
- Responsive grid layout

#### 📊 **Stats Section**
- Key metrics display
- Animated counters
- Gradient background

#### 💰 **Pricing Section**
- 3 pricing tiers
- Popular plan highlighting
- Feature comparison
- Animated cards

#### 👥 **Testimonials Section**
- Customer reviews
- Star ratings
- Avatar placeholders
- Smooth animations

#### 🎯 **About Section**
- Company information
- Key statistics
- Two-column layout
- Animated content

#### 📞 **Call-to-Action Section**
- Lamp container effect
- Compelling copy
- Action buttons
- Gradient backgrounds

#### 🧭 **Navigation**
- Fixed header with scroll effects
- Mobile-responsive menu
- Smooth transitions
- Logo and CTA buttons

## 🛠️ **Technology Stack**

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Aceternity UI** - Custom components

## 🚀 **Getting Started**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000/landing`

## 📁 **File Structure**

```
app/landing/
├── page.tsx                 # Main landing page
components/
├── ui/                      # Aceternity UI components
│   ├── button.tsx
│   ├── spotlight.tsx
│   ├── text-generate-effect.tsx
│   ├── floating-nav.tsx
│   ├── floating-navbar.tsx
│   ├── hero-parallax.tsx
│   ├── grid-background.tsx
│   └── lamp-container.tsx
├── landing/
│   └── navigation.tsx       # Navigation component
lib/
└── utils.ts                 # Utility functions
```

## 🎨 **Design System**

### **Colors**
- **Primary:** Blue gradient (#3B82F6 to #8B5CF6)
- **Background:** Black (#000000)
- **Text:** White and gray variants
- **Accents:** Gradient overlays

### **Typography**
- **Headings:** Bold, large sizes
- **Body:** Regular weight, readable sizes
- **Gradients:** Text with gradient effects

### **Animations**
- **Entrance:** Fade in with slide up
- **Hover:** Scale and color transitions
- **Scroll:** Triggered on viewport entry
- **Stagger:** Delayed animations for lists

## 📱 **Responsive Design**

- **Mobile:** Single column layout
- **Tablet:** Adjusted spacing and sizing
- **Desktop:** Full multi-column layout
- **Breakpoints:** Tailwind CSS responsive classes

## 🎯 **Performance**

- **Optimized images** with Next.js Image component
- **Lazy loading** for better performance
- **Smooth animations** with hardware acceleration
- **Minimal bundle size** with tree shaking

## 🔧 **Customization**

### **Colors**
Update the gradient colors in the component files:
```tsx
className="bg-gradient-to-r from-blue-500 to-purple-500"
```

### **Content**
Modify the content arrays in `page.tsx`:
- `features` - Feature cards
- `pricingPlans` - Pricing tiers
- `testimonials` - Customer reviews

### **Animations**
Adjust animation timing in Framer Motion props:
```tsx
transition={{ duration: 0.8, delay: 0.2 }}
```

## 🌟 **Key Features**

✅ **Modern SaaS Design** - Professional and clean  
✅ **Smooth Animations** - Framer Motion powered  
✅ **Responsive Layout** - Works on all devices  
✅ **Interactive Elements** - Hover and click effects  
✅ **Performance Optimized** - Fast loading times  
✅ **Accessibility** - Screen reader friendly  
✅ **SEO Ready** - Meta tags and structure  
✅ **Easy to Customize** - Modular components  

## 🎉 **Result**

A stunning, professional landing page that:
- **Captures attention** with smooth animations
- **Converts visitors** with clear CTAs
- **Builds trust** with testimonials and stats
- **Looks professional** with modern design
- **Works perfectly** on all devices

The landing page is now live at `/landing` and provides an excellent first impression for the Reputraq platform! 🚀

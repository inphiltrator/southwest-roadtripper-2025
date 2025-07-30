# 🌵 Southwest Roadtripper 2025

**Built by AI Southwest App Builder Agent**

A production-ready roadtrip planning application for the American Southwest (California, Nevada, Utah, Arizona). Experience the magic of Route 66 and beyond with interactive maps, route planning, and cost estimation.

![Southwest Roadtripper](https://img.shields.io/badge/Southwest-USA%20🏜️-orange)
![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)
![Leaflet](https://img.shields.io/badge/Leaflet-Interactive%20Maps-199900?logo=leaflet)

## ✨ Features

### 🗺️ Interactive Southwest Map
- **Leaflet.js** powered interactive maps centered on Las Vegas
- **Click-to-add waypoints** with Southwest-themed markers 🌵
- **Southwest bounds** restricted to CA/NV/UT/AZ region
- **Mobile-responsive** touch controls

### 🛣️ Route Planning
- **OpenRouteService integration** for precise routing
- **Drag & drop waypoint reordering**
- **Real-time distance and duration calculation**
- **Multiple route alternatives** (premium feature)
- **Southwest-optimized** travel estimates (~50 mph average)

### 📍 POI Discovery
- **Overpass API integration** for Points of Interest
- **Southwest-specific categories**: National Parks, Camping, Dining, Attractions
- **Location-based discovery** with customizable radius
- **State-specific top-rated locations**

### 💰 Cost Calculator
- **Southwest-specific pricing** for fuel, lodging, meals
- **Real-time cost updates** as route changes
- **Customizable cost factors** for different travel styles
- **Detailed cost breakdown** by category

### 💾 Trip Management
- **localStorage persistence** with automatic saving
- **Import/Export** functionality (planned)
- **Trip history** and favorites
- **Share trip URLs** (planned)

## 🎨 Design System

### Apple Liquid Glass UI
- **Backdrop blur effects** with CSS `backdrop-filter`
- **Glass card components** with subtle transparency
- **Smooth animations** and hover effects
- **Touch-optimized** interface elements

### Southwest Color Palette
```css
--color-southwest-sunset: #FF6B35;  /* Vibrant orange */
--color-southwest-sage: #9CAF88;    /* Desert sage green */
--color-southwest-canyon: #CD853F;  /* Canyon brown */
--color-southwest-sky: #87CEEB;     /* Sky blue */
--color-southwest-sand: #F4E4C1;    /* Desert sand */
```

### Typography
- **Inter font family** for clean, modern text
- **Responsive sizing** with Tailwind CSS utilities
- **High contrast** for desert sun readability

## 🚀 Tech Stack

### Framework & Language
- **SvelteKit 2.x** - Full-stack web framework
- **Svelte 5** - Component framework with Runes
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### Styling & UI
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Custom Glass Components** - Apple-inspired UI elements
- **CSS Grid & Flexbox** - Modern layout systems
- **Responsive Design** - Mobile-first approach

### Mapping & APIs
- **Leaflet.js** - Interactive mapping library
- **OpenRouteService** - Routing and directions API
- **Overpass API** - POI and geographic data
- **SSR-safe imports** - Dynamic loading for browser-only code

### State Management
- **Svelte Stores** - Reactive state management
- **localStorage integration** - Persistent trip data
- **TypeScript interfaces** - Type-safe data structures

### Testing & Quality
- **Vitest** - Unit and integration testing
- **Playwright** - E2E testing
- **ESLint & Prettier** - Code formatting and linting
- **TypeScript strict mode** - Maximum type safety

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # UI Components
│   │   ├── GlassCard.svelte      # Glass effect container
│   │   ├── GlassButton.svelte    # Interactive glass buttons
│   │   ├── NavigationBar.svelte  # App header with Southwest theme
│   │   ├── MapContainer.svelte   # SSR-safe Leaflet integration
│   │   ├── WaypointManager.svelte # Drag & drop waypoint list
│   │   └── TripCard.svelte       # Trip display component
│   ├── services/            # Business Logic
│   │   ├── RoutingService.ts     # OpenRouteService integration
│   │   ├── POIService.ts         # Overpass API integration
│   │   └── CostCalculatorService.ts # Southwest cost estimation
│   ├── stores/              # State Management
│   │   └── tripStore.ts          # Trip persistence and actions
│   ├── types/               # TypeScript Definitions
│   │   └── index.ts              # Southwest-specific interfaces
│   └── utils/               # Helper Functions
├── routes/                  # SvelteKit Routes
│   └── +page.svelte             # Main application page
├── app.html                 # HTML template
└── app.css                  # Global styles and theme
```

## 🛠️ Development

### Prerequisites
- **Node.js 20+** (recommended)
- **npm** or **yarn**
- **Modern browser** with ES2022 support

### Installation

```bash
# Clone the repository
git clone https://github.com/inphiltrator/southwest-roadtripper-2025.git
cd southwest-roadtripper-2025

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:5173
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check        # TypeScript type checking
```

### Environment Setup

For production features, add API keys to `.env.local`:

```bash
# OpenRouteService API (for real routing)
OPENROUTE_API_KEY=your_openroute_service_key

# Other optional API keys
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
```

## 🌍 API Integration

### OpenRouteService
- **Free tier**: 1000 requests/day
- **Features**: Routing, isochrones, matrix
- **Fallback**: Mock routing with Haversine distance calculation

### Overpass API
- **Free**: Unlimited requests with rate limiting
- **Features**: POI discovery, geographic data
- **Fallback**: Curated Southwest POI database

## 📱 Progressive Web App

*Planned features:*
- **Offline support** with service workers
- **Install prompt** for mobile devices
- **Push notifications** for trip reminders
- **GPS integration** for location-based features

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Build for static deployment
npm run build

# Deploy build folder
netlify deploy --prod --dir build
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "build"]
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript** for all new code
- **Prettier** for code formatting
- **ESLint** for code quality
- **Conventional Commits** for commit messages
- **Component tests** for UI components
- **Unit tests** for business logic

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Roadmap

### Phase 1: Core Features ✅
- [x] Interactive Leaflet map
- [x] Southwest theme implementation
- [x] Waypoint management
- [x] Route calculation
- [x] Cost estimation

### Phase 2: Enhanced UX
- [ ] Real-time traffic data
- [ ] Weather integration
- [ ] Photo galleries for POIs
- [ ] User reviews and ratings
- [ ] Social sharing features

### Phase 3: Advanced Features
- [ ] Multi-day itinerary planning
- [ ] Camping reservation integration
- [ ] Gas price tracking
- [ ] Offline map support
- [ ] Voice navigation

### Phase 4: Community
- [ ] User accounts and profiles
- [ ] Trip sharing community
- [ ] Route recommendations
- [ ] Local guide integration
- [ ] Mobile app (React Native)

## 🙏 Acknowledgments

- **Southwest USA** - For endless inspiration and breathtaking landscapes
- **Route 66** - The Mother Road that started it all
- **OpenStreetMap** - Community-driven mapping data
- **SvelteKit Team** - For an amazing web framework
- **Leaflet.js** - For making maps accessible to everyone

---

*Built with ❤️ by the Southwest App Builder Agent for endless desert highways and unforgettable adventures*

**Happy Trails!** 🚗💨🌵

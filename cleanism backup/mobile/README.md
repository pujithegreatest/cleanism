# Cleanism - AI-Powered Cleaning App

A mobile cleaning task management app that uses AI to provide smart cleaning tips based on photos of areas that need cleaning. Users can create chores, receive personalized cleaning advice, set due dates, categorize tasks by area, and share tasks with housemates.

## Features

### Chores Home Screen
- View all pending chores as preview cards with images
- Filter chores by area (Kitchen, Bathroom, Bedroom, etc.)
- See due dates with smart labels (Today, Tomorrow, Overdue)
- Quick access to add new chores
- Stats showing To Do and Done counts
- Streak counter for consecutive days with completed tasks
- Motivational quotes to keep you inspired
- Smooth animations and haptic feedback

### Add New Chore Flow
1. **Describe the mess**: User provides text context about what needs cleaning (e.g., "bathtub with toys in it", "dishes in the sink")
2. **Select area tag**: Kitchen, Bathroom, Bedroom, Living Room, Garage, Outdoor, Other
3. **Set optional due date**: When the task should be completed
4. **Take photo**: Capture the area that needs cleaning
5. **AI generates tips**: AI analyzes the image and context to provide:
   - A short task name (e.g., "Clean Dishes", "Sweep Floor")
   - A smart 110-character tip ending with "daily smart!"

### Chore Preview Cards
Each card displays:
- **Image with gradient overlay**: Before photo with area tag badge
- **Due date badge**: Color-coded urgency indicator on image
- **Title**: Task name below image
- **AI Tip**: Cleaning advice with bulb icon

### Chore Detail Screen
- Full-size before image with gradient overlay
- Area tag and completion badge on image
- Task name prominently displayed
- Due date card with calendar icon
- AI cleaning tip in gradient card
- Your description section
- Gradient "Mark as Done" button with haptic feedback
- Share and delete actions in header

### History Screen
- View all completed chores
- Stats showing completed vs pending
- Animated progress bar with completion percentage
- Completion timestamps

### Settings Screen with Theme Switcher
5 beautiful themes available:

1. **8-Bit Classic** (Default)
   - Light: Teal background (#CFEFEC), Red text (#80171F)
   - Dark: Brown background (#3D3737), Teal text (#CFEFEC)
   - Accents: Blue, Teal, Green, Gold

2. **Ocean Blue**
   - Light: Cyan background (#E0F7FA), Navy text (#01579B)
   - Dark: Dark slate (#263238)
   - Accents: Blues and Cyans

3. **Sunset Orange**
   - Light: Cream background (#FFF3E0), Orange text (#E65100)
   - Dark: Brown background (#3E2723)
   - Accents: Oranges and Ambers

4. **Forest Green**
   - Light: Mint background (#E8F5E9), Forest text (#1B5E20)
   - Dark: Dark slate (#263238)
   - Accents: Greens

5. **Royal Purple**
   - Light: Lavender background (#F3E5F5), Purple text (#4A148C)
   - Dark: Dark slate (#263238)
   - Accents: Purples

### Share Functionality
Share chores with housemates via native share sheet including:
- Task name
- AI cleaning tip
- Before image attachment
- "Shared from Cleanism" branding

## Tech Stack

- **Framework**: Expo SDK 53 with React Native 0.76.7
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Animations**: react-native-reanimated
- **Gradients**: expo-linear-gradient
- **Haptics**: expo-haptics
- **AI Integration**: OpenAI GPT-4o Vision API for image analysis
- **Camera**: expo-camera
- **Icons**: @expo/vector-icons (Ionicons)
- **Date Handling**: date-fns

## App Structure

```
src/
├── components/           # Reusable components
├── screens/
│   ├── HomeScreen.tsx         # Main chores dashboard with filter
│   ├── AddChoreScreen.tsx     # Step 1: Description & options
│   ├── CameraScreen.tsx       # Step 2: Take photo, AI analysis
│   ├── ChoreDetailScreen.tsx  # View/edit individual chore
│   ├── HistoryScreen.tsx      # Completed chores history
│   └── SettingsScreen.tsx     # Theme switcher & app settings
├── navigation/
│   ├── RootNavigator.tsx      # Bottom tab + stack navigation
│   └── types.ts               # Navigation type definitions
├── state/
│   ├── choreStore.ts          # Chore state management
│   └── themeStore.ts          # Theme state management
├── types/
│   ├── chore.ts               # Chore & theme type definitions
│   └── ai.ts                  # AI API type definitions
└── api/
    ├── chat-service.ts        # OpenAI & Grok API integration
    ├── openai.ts              # OpenAI client setup
    └── grok.ts                # Grok client setup
```

## State Management

### Chore Store (`choreStore.ts`)
- **State**:
  - `chores`: Array of all chores

- **Actions**:
  - `addChore()`: Create new chore with AI-generated tip
  - `updateChore()`: Update chore details
  - `deleteChore()`: Remove a chore
  - `completeChore()`: Mark chore as done
  - `uncompleteChore()`: Mark chore as incomplete
  - `getChoresByArea()`: Filter by area tag
  - `getPendingChores()`: Get incomplete chores
  - `getCompletedChores()`: Get finished chores
  - `getOverdueChores()`: Get past-due chores

### Theme Store (`themeStore.ts`)
- **State**:
  - `themeId`: Current theme identifier
  - `isDarkMode`: Dark mode toggle

- **Actions**:
  - `setTheme()`: Change current theme
  - `toggleDarkMode()`: Switch between light/dark
  - `getColors()`: Get current theme colors

## How It Works

1. **Describe the mess**: User describes what needs cleaning in their own words
2. **Select area**: Choose which room/area the chore belongs to
3. **Set due date** (optional): When the task should be completed
4. **Take photo**: Capture the area that needs cleaning
5. **AI Analysis**: Image + description sent to OpenAI GPT-4o Vision
6. **Generate task**: AI creates task name and 110-char cleaning tip
7. **Track progress**: View all chores, filter by area, check completion
8. **Share tasks**: Send chore cards to housemates for delegation

## Area Tags

- Kitchen
- Bathroom
- Bedroom
- Living Room
- Garage
- Outdoor
- Other

Each area has its own icon for easy visual identification.

## Key Dependencies

- `@react-navigation/native`: Navigation framework
- `@react-navigation/bottom-tabs`: Bottom tab navigation
- `@react-navigation/native-stack`: Native stack navigation
- `zustand`: State management
- `@react-native-async-storage/async-storage`: Persistent storage
- `expo-camera`: Camera access
- `expo-file-system`: File operations for image handling
- `expo-linear-gradient`: Gradient backgrounds
- `expo-haptics`: Haptic feedback
- `react-native-reanimated`: Smooth animations
- `nativewind`: Styling with TailwindCSS
- `date-fns`: Date formatting and comparison
- `openai`: OpenAI API client
- `uuid`: Unique ID generation
- `@react-native-community/datetimepicker`: Date picker

## Environment Variables

The app requires an OpenAI API key for AI features:
- `EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY`: OpenAI API key

## Design Principles

- **Clean & Modern UI**: Following Apple Human Interface Guidelines
- **Themeable**: 5 color themes with light/dark mode support
- **Animated**: Smooth enter animations and micro-interactions
- **Haptic Feedback**: Tactile response on button presses
- **Card-based layout**: Visual preview cards for each chore
- **Gradient accents**: Beautiful gradient buttons and progress bars
- **Smart AI tips**: Actionable, specific cleaning advice
- **Area organization**: Filter and sort tasks by room
- **Shareable tasks**: Easy delegation to housemates with images
- **Streak tracking**: Gamification to encourage daily cleaning

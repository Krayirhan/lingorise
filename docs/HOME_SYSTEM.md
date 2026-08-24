# LingoRise Home System Documentation

## 1. Component Contracts & Architecture
`src/features/home/` contains decoupled components adhering to the single responsibility principle and strict size constraints (< 120 lines):
- **`HomeHeader.tsx`**: Top bar with brand logo, streak badge, level picker, and `__DEV__` only reload button.
- **`GardenHeroCard.tsx`**: Primary daily action card with XP reward, estimated time, real growth progress %, and non-intrusive Sprig mascot.
- **`GardenProgressCard.tsx`**: Core skill progress rows (Vocabulary dynamic mastery % and Listening with clear 'Yakında' status).
- **`DailyQuestCard.tsx`**: Daily practice and review quests with completion badges and min 44px touch targets.
- **`ReviewCard.tsx`**: Spaced repetition review card displayed conditionally only when `reviewCount > 0`.
- **`RecommendedWordCard.tsx`**: Daily vocabulary recommendation with level tag, topic tag, and safe speech pronunciation.
- **`BadgesCard.tsx`**: Unlocked garden badges showcase.
- **`HomeBottomNav.tsx`**: Fixed bottom navigation bar with meaningful Ionicons (`leaf`, `play-circle`, `stats-chart`, `person`) and safe-area padding.

---

## 2. HomeViewModel Data Model
`HomeScreen.tsx` does not perform state calculations or direct service calls. All state is prepared by `useHomeViewModel.ts`:

```typescript
export interface HomeViewModel {
  level: LevelCode;
  xp: number;
  streak: number;
  stageName: string;
  gardenProgress: GardenProgress;
  dailyQuests: DailyQuest[];
  reviewCount: number;
  skillProgress: SkillProgress[];
  recommendedWord: RecommendedWordData;
  badges: string[];
}
```

---

## 3. Navigation Routes
- **`home`**: Main dashboard (`HomeScreen.tsx`)
- **`practice`**: Meaning Match interactive game (`PracticeScreen.tsx`)
- **`progress`**: Full progress analytics & level mastery breakdown (`ProgressScreen.tsx`)
- **`profile`**: User stats, language toggle, level picker, and reminders (`ProfileScreen.tsx`)
- **`onboarding`**: 3-step onboarding and level placement (`OnboardingScreen.tsx`)

---

## 4. Quality & Compliance
- **All Screens**: <= 250 lines
- **All Components**: <= 120 lines
- **Domain Logic**: Pure TypeScript with 0 React Native imports
- **Localization**: 126 keys with 100% exact parity between TR and EN
- **Testing**: 31 automated tests passing (`npm test`)

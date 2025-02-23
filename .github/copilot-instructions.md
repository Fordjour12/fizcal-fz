
  You are an expert in TypeScript, React Native, Expo, and Mobile UI development.

  Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Expo's official documentation for setting up and configuring your projects: <https://docs.expo.dev/>
- Use functional components and hooks over class components.
- Ensure components are modular, reusable, and maintainable.
- Organize files by feature, grouping related components, hooks, and styles.

  Naming Conventions

- Use lowercase with dashes for directory names (e.g., components/auth-wizard).
- Favor named exports for components.
- Use camelCase for variable and function names (e.g., `isFetchingData`, `handleUserInput`).
- Use PascalCase for component names (e.g., `UserProfile`, `ChatScreen`).
- Directory names should be lowercase and hyphenated (e.g., `user-profile`, `chat-screen`).
  
  TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.
- Use strict mode in TypeScript for better type safety.
- Use TypeScript for all components, favoring interfaces for props and state.
- Enable strict typing in `tsconfig.json`.
- Avoid using `any`; strive for precise types.

  Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

  UI and Styling

- Use Expo's built-in components for common UI patterns and layouts.
- Implement responsive design with Flexbox and Expo's useWindowDimensions for screen size adjustments.
- Consistent Styling: Use StyleSheet.create() for consistent styling or Styled Components for dynamic styles.
- Responsive Design: Ensure your design adapts to various screen sizes and orientations. Consider using responsive units and libraries like react-native-responsive-screen.
- Optimize Image Handling: Use optimized image libraries like react-native-fast-image to handle images efficiently.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Leverage react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

  Safe Area Management

- Use SafeAreaProvider from react-native-safe-area-context to manage safe areas globally in your app.
- Wrap top-level components with SafeAreaView to handle notches, status bars, and other screen insets on both iOS and Android.
- Use SafeAreaScrollView for scrollable content to ensure it respects safe area boundaries.
- Avoid hardcoding padding or margins for safe areas; rely on SafeAreaView and context hooks.

  Performance Optimization

- Minimize the use of useState and useEffect; prefer context and reducers for state management.
- Use Expo's AppLoading and SplashScreen for optimized app startup experience.
- Optimize images: use WebP format where supported, include size data, implement lazy loading with expo-image.
- Implement code splitting and lazy loading for non-critical components with React's Suspense and dynamic imports.
- Profile and monitor performance using React Native's built-in tools and Expo's debugging features.
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately.

  Navigation

- Expo Router: Use Expo Router for file-based routing in your React Native app. It provides native navigation, deep linking, and works across Android, iOS, and web. Refer to the official documentation for setup and usage: <https://docs.expo.dev/router/introduction/>
- Leverage deep linking and universal links for better user engagement and navigation flow.
- Use dynamic routes with expo-router for better navigation handling.

  State Management

- Use React Context and useReducer for managing global state.
- Leverage react-query for data fetching and caching; avoid excessive API calls.
- For complex state management, consider using Zustand or Redux Toolkit.
- Handle URL search parameters using libraries like expo-linking.

  Error Handling and Validation

- Use Zod for runtime validation and error handling.
- Implement proper error logging using Sentry or a similar service.
- Prioritize error handling and edge cases:
  - Handle errors at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Implement global error boundaries to catch and handle unexpected errors.
- Use expo-error-reporter for logging and reporting errors in production.

  Testing

- Write unit tests using Jest and React Native Testing Library.
- Implement integration tests for critical user flows using Detox.
- Use Expo's testing tools for running tests in different environments.
- Consider snapshot testing for components to ensure UI consistency.

  Security

- Sanitize user inputs to prevent XSS attacks.
- Use react-native-encrypted-storage for secure storage of sensitive data.
- Ensure secure communication with APIs using HTTPS and proper authentication.
- Use Expo's Security guidelines to protect your app: <https://docs.expo.dev/guides/security/>

  Internationalization (i18n)

- Use react-native-i18n or expo-localization for internationalization and localization.
- Support multiple languages and RTL layouts.
- Ensure text scaling and font adjustments for accessibility.

  Key Conventions

  1. Rely on Expo's managed workflow for streamlined development and deployment.
  2. Prioritize Mobile Web Vitals (Load Time, Jank, and Responsiveness).
  3. Use expo-constants for managing environment variables and configuration.
  4. Use expo-permissions to handle device permissions gracefully.
  5. Implement expo-updates for over-the-air (OTA) updates.
  6. Follow Expo's best practices for app deployment and publishing: <https://docs.expo.dev/distribution/introduction/>
  7. Ensure compatibility with iOS and Android by testing extensively on both platforms.

  API Documentation

- Use Expo's official documentation for setting up and configuring your projects: <https://docs.expo.dev/>

  Refer to Expo's documentation for detailed information on Views, Blueprints, and Extensions for best practices.

  You are an expert in TypeScript, React Native, Expo, and Mobile App Development.
  
  Code Style and Structure:

- Write concise, type-safe TypeScript code.
- Use functional components and hooks over class components.
- Ensure components are modular, reusable, and maintainable.
- Organize files by feature, grouping related components, hooks, and styles.
  
  Naming Conventions:

- Use camelCase for variable and function names (e.g., `isFetchingData`, `handleUserInput`).
- Use PascalCase for component names (e.g., `UserProfile`, `ChatScreen`).
- Directory names should be lowercase and hyphenated (e.g., `user-profile`, `chat-screen`).
  
  TypeScript Usage:

- Use TypeScript for all components, favoring interfaces for props and state.
- Enable strict typing in `tsconfig.json`.
- Avoid using `any`; strive for precise types.
- Utilize `React.FC` for defining functional components with props.
  
  Performance Optimization:

- Minimize `useEffect`, `useState`, and heavy computations inside render methods.
- Use `React.memo()` for components with static props to prevent unnecessary re-renders.
- Optimize FlatLists with props like `removeClippedSubviews`, `maxToRenderPerBatch`, and `windowSize`.
- Use `getItemLayout` for FlatLists when items have a consistent size to improve performance.
- Avoid anonymous functions in `renderItem` or event handlers to prevent re-renders.
  
  UI and Styling:

- Use consistent styling, either through `StyleSheet.create()` or Styled Components.
- Ensure responsive design by considering different screen sizes and orientations.
- Optimize image handling using libraries designed for React Native, like `react-native-fast-image`.
  
  Best Practices:

- Follow React Native's threading model to ensure smooth UI performance.
- Utilize Expo's EAS Build and Updates for continuous deployment and Over-The-Air (OTA) updates.
- Use React Navigation for handling navigation and deep linking with best practices.

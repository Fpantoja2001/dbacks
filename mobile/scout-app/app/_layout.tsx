import { Stack } from 'expo-router';

export default function RootLayout() {
  return (<Stack screenOptions={{ headerShown: false}}>
      <Stack.Screen name="index" />
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="(tabs)" options={{ 
        headerShown: false, 
        animation: 'none'
        }} />
      <Stack.Screen
        name="addPlayer"
        options={{
          animation: 'none'
        }}
      />
      <Stack.Screen name="SelectRoster" />
      <Stack.Screen name="Session" />
      <Stack.Screen name="TurnSetup" />
      <Stack.Screen name="addTurn" />
      <Stack.Screen name="TurnDetail" />
      <Stack.Screen name="historySessionDetail" />
      <Stack.Screen name="historyTurnDetail" />
  </Stack>
  );
}
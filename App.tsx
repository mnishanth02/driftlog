import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "./lib/contexts/ThemeContext";
import { ThemeDemo } from "./components/ThemeDemo";

import "./global.css";

function AppContent() {
	const { colorScheme } = useTheme();

	return (
		<>
			<ThemeDemo />
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
		</>
	);
}

export default function App() {
	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	);
}

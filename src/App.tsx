import { AppProvider } from "./app/providers/AppProvider";
import { AppThemeProvider } from "./app/providers/ThemeProvider";
import { AppRouter } from "./app/router";

function App() {
  return (
    <AppThemeProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AppThemeProvider>
  );
}

export default App;
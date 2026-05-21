import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div 
      className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
      onClick={toggleTheme}
      data-testid="theme-toggle"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-slider">
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </div>
  );
}

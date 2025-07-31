import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = 'd42f487f103ac07de71cd4390a51aceb';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (data.cod === '404') {
        setWeather(null);
        setError('City not found. Please try again.');
      } else {
        setWeather(data);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Emoji-based weather icon map
  const renderWeatherIcon = (main) => {
    switch (main) {
      case 'Clear':
        return <span className="text-yellow-300 text-6xl">☀️</span>;
      case 'Clouds':
        return <span className="text-slate-100 text-6xl">☁️</span>;
      case 'Rain':
        return <span className="text-blue-300 text-6xl">🌧️</span>;
      case 'Drizzle':
        return <span className="text-blue-200 text-6xl">🌦️</span>;
      case 'Thunderstorm':
        return <span className="text-yellow-100 text-6xl">⛈️</span>;
      case 'Snow':
        return <span className="text-white text-6xl">❄️</span>;
      case 'Mist':
      case 'Haze':
      case 'Fog':
        return <span className="text-gray-300 text-6xl">🌫️</span>;
      default:
        return <span className="text-slate-200 text-6xl">🌡️</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-800 via-cyan-700 to-emerald-500 flex items-center justify-center px-4 font-sans text-slate-100">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-wide text-slate-100">
            🌍 Weather Snap
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Enter any city to get live weather info instantly.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search city..."
            className="flex-1 px-5 py-3 rounded-full bg-white/20 text-slate-100 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-white text-cyan-800 font-semibold rounded-full hover:bg-gray-100 transition"
            onClick={fetchWeather}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && (
          <p className="text-red-300 mb-4 text-center tracking-wide font-semibold">
            {error}
          </p>
        )}

        <AnimatePresence>
          {weather && (
            <motion.div
              key="weather-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="mt-6 bg-white/20 rounded-2xl p-6 text-center space-y-4 backdrop-blur-md hover:shadow-xl transition"
            >
              <h2 className="text-2xl font-semibold tracking-wide">
                {weather.name}, <span className="text-cyan-100">{weather.sys.country}</span>
              </h2>

              <div className="flex justify-center">
                {renderWeatherIcon(weather.weather[0].main)}
              </div>

              <div className="text-5xl font-extrabold text-yellow-200">
                {Math.round(weather.main.temp)}°C
              </div>

              <p className="capitalize italic text-slate-200 tracking-wide">
                {weather.weather[0].description}
              </p>

              <div className="flex justify-around text-base text-slate-100 pt-4 border-t border-white/30 mt-4 font-medium">
                <div>
                  <span className="block text-sm text-cyan-100 font-bold">Humidity</span>
                  {weather.main.humidity}%
                </div>
                <div>
                  <span className="block text-sm text-cyan-100 font-bold">Wind</span>
                  {weather.wind.speed} m/s
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-10 text-sm text-center text-slate-200 font-medium tracking-wide">
          Made with ❤️ by Apurba
        </footer>
      </div>
    </div>
  );
}


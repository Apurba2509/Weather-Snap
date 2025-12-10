import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, MapPin, Loader2, Navigation } from 'lucide-react';
import { format } from 'date-fns';

const API_KEY = 'd42f487f103ac07de71cd4390a51aceb';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgGradient, setBgGradient] = useState('from-teal-800 via-emerald-800 to-slate-900');

  // Dynamic Background based on weather
  useEffect(() => {
    if (!weather) {
      setBgGradient('from-teal-800 via-emerald-800 to-slate-900');
      return;
    }
    const main = weather.weather[0].main;
    const isNight = weather.weather[0].icon.includes('n');

    if (main === 'Clear') {
      setBgGradient(isNight ? 'from-slate-900 via-purple-900 to-slate-900' : 'from-blue-400 via-blue-300 to-blue-200');
    } else if (main === 'Clouds') {
      setBgGradient(isNight ? 'from-gray-800 via-gray-900 to-black' : 'from-gray-300 via-gray-400 to-gray-500');
    } else if (main === 'Rain' || main === 'Drizzle') {
      setBgGradient('from-slate-800 via-slate-700 to-gray-800');
    } else if (main === 'Thunderstorm') {
      setBgGradient('from-gray-900 via-purple-900 to-indigo-900');
    } else if (main === 'Snow') {
      setBgGradient('from-blue-100 via-indigo-100 to-white');
    } else {
      setBgGradient('from-gray-700 via-gray-800 to-gray-900');
    }
  }, [weather]);

  const resetToHome = () => {
    setWeather(null);
    setForecast(null);
    setCity('');
    setBgGradient('from-teal-800 via-emerald-800 to-slate-900');
  };

  const fetchWeather = async (queryCity = city) => {
    if (!queryCity) return;
    setLoading(true);
    setError('');

    try {
      // Fetch Current Weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=${API_KEY}&units=metric`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.cod !== 200) {
        throw new Error(weatherData.message);
      }
      setWeather(weatherData);

      // Fetch 5-Day Forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${queryCity}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      // Get one forecast per day (approx 12:00 PM)
      const dailyForecast = forecastData.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00")
      ).slice(0, 5);

      setForecast(dailyForecast);

    } catch (err) {
      setError(err.message === 'city not found' ? 'City not found. Please try again.' : 'Failed to fetch weather.');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Popular cities for the empty state
  const popularCities = [
    { city: 'London', country: 'GB' },
    { city: 'New York', country: 'US' },
    { city: 'Tokyo', country: 'JP' },
    { city: 'Sydney', country: 'AU' },
  ];

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
          const data = await res.json();
          fetchWeather(data.name);
          setCity(data.name);
        } catch (err) {
          console.error(err);
          setError("Could not get location weather.");
          setLoading(false);
        }
      }, () => {
        setError("Location access denied.");
        setLoading(false);
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ease-in-out bg-gradient-to-br ${bgGradient} ${!weather ? 'animate-gradient' : ''} flex items-center justify-center p-4 md:p-8 font-sans text-white overflow-y-auto`}
    >

      {/* Glassmorphism Container */}
      <div className="relative w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[2.5rem] p-4 md:p-6 flex flex-col md:flex-row md:min-h-[500px]">

        {/* Left Section: Main Weather */}
        <div className="flex-1 flex flex-col justify-between p-4 md:p-6 gap-6">

          {/* Header / Search */}
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span onClick={resetToHome} className="text-2xl md:text-4xl font-bold tracking-tighter drop-shadow-md whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity">🌍 Weather Snap</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search city..."
                  className="w-full bg-black/20 border border-white/10 rounded-full px-10 py-2.5 text-sm focus:outline-none focus:bg-black/30 transition-all placeholder:text-white/40"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchWeather(city)}
                />
              </div>
              <button onClick={() => fetchWeather(city)} className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md shrink-0">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              </button>
              <button onClick={handleGeoLocation} className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md shrink-0" title="Use Current Location">
                <Navigation size={18} />
              </button>
            </div>
            {error && <p className="text-red-300 text-sm ml-2">{error}</p>}
          </header>

          {/* Current Weather Display */}
          <AnimatePresence mode='wait'>
            {weather ? (
              <motion.div
                key="current"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-2 md:mt-0"
              >
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin size={18} />
                  <h2 className="text-lg font-medium tracking-wide">{weather.name}, {weather.sys.country}</h2>
                </div>

                <div className="flex flex-col items-start mt-4">
                  <div className="flex items-center flex-wrap">
                    <h1 className="text-[4.5rem] md:text-[6rem] font-bold leading-none tracking-tighter bg-gradient-to-b from-white to-white/50 text-transparent bg-clip-text">
                      {Math.round(weather.main.temp)}°
                    </h1>
                    <div className="flex flex-col justify-center ml-4">
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg"
                      />
                      <span className="text-lg md:text-xl font-light capitalize italic whitespace-nowrap">{weather.weather[0].description}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-white/60 mt-4">
                  Updated as of {format(new Date(), 'h:mm a')}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-start justify-center h-full mt-8 md:mt-0 py-10 md:py-0"
              >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome!</h2>
                <p className="text-white/60 mb-6 max-w-xs text-sm md:text-base">Explore weather around the world. Search for a city or check these popular places.</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Section: Details & Forecast */}
        <div className="flex-1 md:bg-black/20 md:backdrop-blur-xl md:rounded-[2rem] p-5 md:p-6 flex flex-col gap-8 md:border-l border-white/10 mt-6 md:mt-0">

          {weather ? (
            <>
              {/* Highlights Grid */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/10 rounded-3xl p-5 border border-white/5"
              >
                <h3 className="text-md font-semibold mb-4 opacity-90 pl-1">Weather Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <HighlightCard icon={Droplets} title="Humidity" value={`${weather.main.humidity}%`} />
                  <HighlightCard icon={Wind} title="Wind" value={`${weather.wind.speed} m/s`} />
                  <HighlightCard icon={Eye} title="Visibility" value={`${weather.visibility / 1000} km`} />
                  <HighlightCard icon={Gauge} title="Pressure" value={`${weather.main.pressure} hPa`} />
                  <HighlightCard icon={Sunrise} title="Sunrise" value={formatTime(weather.sys.sunrise)} />
                  <HighlightCard icon={Sunset} title="Sunset" value={formatTime(weather.sys.sunset)} />
                </div>
              </motion.div>

              {/* Forecast List */}
              {forecast && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-black/10 rounded-3xl p-5 border border-white/5"
                >
                  <h3 className="text-md font-semibold mb-3 mt-1 opacity-90 pl-1">5-Day Forecast</h3>
                  <div className="space-y-3">
                    {forecast.map((day) => (
                      <div key={day.dt} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                        <span className="w-16 text-sm font-medium opacity-80">{format(new Date(day.dt * 1000), 'EEE')}</span>
                        <div className="flex items-center gap-2">
                          <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="icon" className="w-6 h-6" />
                          <span className="text-xs opacity-60 capitalize hidden sm:block">{day.weather[0].main}</span>
                        </div>
                        <span className="font-bold text-sm">{Math.round(day.main.temp)}°C</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col justify-center bg-black/10 rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4 opacity-90">Popular Cities</h3>
              <div className="grid grid-cols-1 gap-4">
                {popularCities.map((pc) => (
                  <button
                    key={pc.city}
                    onClick={() => { fetchWeather(pc.city); setCity(pc.city); }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/20 hover:scale-[1.02] transition-all border border-white/5 group text-left"
                  >
                    <span className="font-medium">{pc.city}, {pc.country}</span>
                    <Search size={16} className="text-white/0 group-hover:text-white/50 transition-all opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function HighlightCard({ icon: Icon, title, value }) {
  return (
    <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition border border-white/5 min-w-0">
      <div className="p-1.5 bg-white/10 rounded-full text-white/80 shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-white/50 uppercase tracking-wider truncate">{title}</p>
        <p className="text-sm md:text-base font-medium leading-tight break-words">{value}</p>
      </div>
    </div>
  )
}

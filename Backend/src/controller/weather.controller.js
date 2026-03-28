import axios from 'axios';

const getWeatherCondition = (code) => {
    if (code === 0) return { label: "Clear", icon: "☀️" };
    if (code <= 3) return { label: "Partly Cloudy", icon: "🌤" };
    if (code <= 48) return { label: "Fog", icon: "🌫" };
    if (code <= 67) return { label: "Rain", icon: "🌧" };
    if (code <= 77) return { label: "Snow", icon: "❄️" };
    if (code <= 99) return { label: "Thunderstorm", icon: "⛈" };
    return { label: "Unknown", icon: "❓" };
};

export const getForecast = async (req, res) => {
    try {
        const { lat = 20.2105, lon = 85.6812 } = req.query;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

        const response = await axios.get(url);
        const data = response.data;
        const daily = data.daily;

        const weatherData = daily.time.map((date, index) => ({
            date: date,
            maxTemp: daily.temperature_2m_max[index],
            minTemp: daily.temperature_2m_min[index],
            condition: getWeatherCondition(daily.weathercode[index])
        }));

        res.status(200).json({
            status: 'success',
            data: weatherData
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch weather data'
        });
    }
};

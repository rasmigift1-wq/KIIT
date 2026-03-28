import { Ollama } from 'ollama';
import axios from 'axios';

const FASTAPI_URL = "http://127.0.0.1:8000/predict-carbon"

function calculateAQI_PM25(pm25) {
  let mockdata = {
    aqi: 54,
    status: "Moderate",
    description: "Air quality is acceptable.",
    temp: 30,
    tdescription: "Normal",
    humidity: 70,
    hdescription: "Normal",
    uvIndex: 5,
    uvDescription: "Moderate"
  }
  if (pm25 <= 30) {
    mockdata.aqi = Math.round((50 / 30) * pm25 * 1.7);
    mockdata.status = "Good";
    mockdata.description = "Air quality is satisfactory, and air pollution poses little or no risk.";
  } else if (pm25 <= 60) {
    mockdata.aqi = Math.round((((100 - 51) / (60 - 31)) * (pm25 - 31) + 51) * 1.7);
    mockdata.status = "Moderate";
    mockdata.description = "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.";
  } else if (pm25 <= 90) {
    mockdata.aqi = Math.round((((200 - 101) / (90 - 61)) * (pm25 - 61) + 101) * 1.7);
    mockdata.status = "Unhealthy for Sensitive Groups";
    mockdata.description = "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
  } else if (pm25 <= 120) {
    mockdata.aqi = Math.round((((300 - 201) / (120 - 91)) * (pm25 - 91) + 201) * 1.7);
    mockdata.status = "Unhealthy";
    mockdata.description = "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.";
  } else if (pm25 <= 250) {
    mockdata.aqi = Math.round((((400 - 301) / (250 - 121)) * (pm25 - 121) + 301) * 1.7);
    mockdata.status = "Very Unhealthy";
    mockdata.description = "Health alert: The risk of health effects is increased for everyone.";
  } else {
    mockdata.aqi = Math.round((((500 - 401) / (500 - 251)) * (pm25 - 251) + 401) * 1.7);
    mockdata.status = "Hazardous";
    mockdata.description = "Health warning of emergency conditions: everyone is more likely to be affected.";
  }

  return mockdata;
}

export const getAQI = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log(`Received AQI request for coordinates: (${latitude}, ${longitude})`);

    const aqiResponse = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}`);
    const mockdata = calculateAQI_PM25(aqiResponse.data.list[0].components.pm2_5);
    console.log(`Calculated AQI: ${mockdata.aqi} for coordinates: (${latitude}, ${longitude})`);
    
    const gettemp = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
    mockdata.temp = gettemp.data.main.temp;
    
    if (mockdata.temp <= 0) mockdata.tdescription = "Freezing";
    else if (mockdata.temp <= 15) mockdata.tdescription = "Cold";
    else if (mockdata.temp <= 25) mockdata.tdescription = "Normal";
    else if (mockdata.temp <= 35) mockdata.tdescription = "Hot";
    else mockdata.tdescription = "Scorching";

    mockdata.humidity = gettemp.data.main.humidity;
    if (mockdata.humidity <= 30) mockdata.hdescription = "Low";
    else if (mockdata.humidity <= 60) mockdata.hdescription = "Normal";
    else mockdata.hdescription = "High";

    const uvres = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=uv_index`);
    mockdata.uvIndex = uvres.data.current.uv_index;
    
    if (mockdata.uvIndex <= 2) mockdata.uvDescription = "Low";
    else if (mockdata.uvIndex <= 5) mockdata.uvDescription = "Moderate";
    else if (mockdata.uvIndex <= 7) mockdata.uvDescription = "High";
    else mockdata.uvDescription = "Very High";

    res.status(200).json({ status: 'success', data: mockdata });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch AQI data" });
  }
};

export const weattherforcast = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log(`Received weather forecast request for coordinates: (${latitude}, ${longitude})`);
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
    res.status(200).json({ status: 'success', data: response.data });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch weather forecast data" });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const OLLAMA_HOST = process.env.OLLAMA_URL || "https://ollama.com";
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b";
    const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

    console.log(`Sending chat request to Ollama Cloud: ${OLLAMA_HOST} using model: ${OLLAMA_MODEL}`);

    const ollama = new Ollama({
      host: OLLAMA_HOST,
      headers: OLLAMA_API_KEY ? {
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      } : undefined,
    });

    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content: "You are the ClimaCare AI assistant, an expert in environmental sustainability, carbon footprint reduction, and waste management. You help users navigate the ClimaCare dashboard, analyze their environmental metrics, and offer actionable advice to live more sustainably. Keep responses concise, supportive, and formatted cleanly. Do not use markdown headers unless necessary."
        },
        {
          role: "user",
          content: message
        }
      ],
      stream: false
    });

    res.status(200).json({ reply: response.message.content });
  } catch (error) {
    console.error("AI Chat failed detailed error:", error);
    res.status(500).json({ 
      message: "AI Chat failed", 
      error: error.message,
      details: error.response?.data || "No extra data"
    });
  }
};

export const calculateCarbonFootprint = async (req, res) => {
  try {
    const payload = req.body;
    console.log("Received payload for carbon footprint calculation:", payload);
    const response = await axios.post(FASTAPI_URL, payload);
    res.status(200).json({ status: 'success', data: response.data });
    console.log("Carbon footprint calculation successful:", response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate carbon footprint" });
  }
};

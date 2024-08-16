import React, { useState } from 'react';
import styled from 'styled-components';

const WeatherCardContainer = styled.div`
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;


const WeatherForm = styled.form`
  margin: 20px;
`;

const CityInput = styled.input`
  padding: 10px;
  font-size: 1rem;
  font-weight: bold;
  border: 2px solid hsla(0, 0%, 20%, 0.3);
  border-radius: 10px;
  margin: 10px;
  width: 200px;
  color: black;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-weight: bold;
  font-size: 1rem;
  background-color: orange;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: blue;
  }
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 5px hsla(0, 0%, 0%, 0.5);
  min-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CityDisplay = styled.h1`
  margin-top: 0;
  margin-bottom: 15px;
`;

const TempDisplay = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: hsla(0, 0%, 0%, 0.8);
  margin-bottom: 15px;
`;

const HumidityDisplay = styled.p`
  font-weight: bold;
  margin-bottom: 15px;
`;

const DescDisplay = styled.p`
  font-style: italic;
  font-weight: bold;
  font-size: 1.2rem;
`;

const WeatherEmoji = styled.p`
  margin: 0;
  font-size: 2rem;
`;

const ErrorDisplay = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: hsla(0, 0%, 0%, 0.75);
`;

const WeatherCard = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const getWeatherData = async (city) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${"1491946ec285381d5ec4ce34930cafbd"}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Could not fetch weather data.');
    }
    return await response.json();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (city) {
      try {
        const data = await getWeatherData(city);
        setWeatherData(data);
        setError('');
      } catch (error) {
        console.error(error);
        setError('Could not fetch weather data');
        setWeatherData(null);
      }
    } else {
      setError('Please enter a city');
      setWeatherData(null);
    }
  };

  const getWeatherEmoji = (weatherId) => {
    switch (true) {
      case weatherId >= 200 && weatherId < 300:
        return '⛈️';
      case weatherId >= 300 && weatherId < 400:
        return '🌦️';
      case weatherId >= 500 && weatherId < 600:
        return '🌧️';
      case weatherId >= 600 && weatherId < 700:
        return '❄️';
      case weatherId >= 700 && weatherId < 800:
        return '🌫️';
      case weatherId === 800:
        return '☀️';
      case weatherId >= 801 && weatherId < 810:
        return '⛅';
      default:
        return '🌈';
    }
  };

  return (
    <WeatherCardContainer>
      <WeatherForm onSubmit={handleSubmit}>
        <CityInput
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <SubmitButton type="submit">Get Weather</SubmitButton>
      </WeatherForm>

      <Card style={{ display: weatherData || error ? 'flex' : 'none' }}>
        {error && <ErrorDisplay>{error}</ErrorDisplay>}
        {weatherData && (
          <>
            <CityDisplay>{weatherData.name}</CityDisplay>
            <TempDisplay>
              {((weatherData.main.temp - 273.15) * (9 / 5) + 32).toFixed(1)}°F
            </TempDisplay>
            <HumidityDisplay>Humidity: {weatherData.main.humidity}%</HumidityDisplay>
            <DescDisplay>{weatherData.weather[0].description}</DescDisplay>
            <WeatherEmoji>{getWeatherEmoji(weatherData.weather[0].id)}</WeatherEmoji>
          </>
        )}
      </Card>
    </WeatherCardContainer>
  );
};

export default WeatherCard;

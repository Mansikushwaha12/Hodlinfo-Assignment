const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://mansi:mansi@cluster0.emyokxy.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  baseUnit: String,
});

const Ticker = mongoose.model('Ticker', tickerSchema);

async function fetchData() {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const top10Data = Object.values(response.data).slice(0, 10);

    await Ticker.insertMany(top10Data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

app.get('/', async (req, res) => {
  try {
    const data = await Ticker.find({});
    res.json({ data });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  fetchData();
});

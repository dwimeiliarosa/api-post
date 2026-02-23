require('dotenv').config();

const express = require('express');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);
app.use(postRoutes);

app.listen(3000, () => {
  console.log('Server jalan di http://localhost:3000');
  console.log('Swagger di http://localhost:3000/api-docs');
});
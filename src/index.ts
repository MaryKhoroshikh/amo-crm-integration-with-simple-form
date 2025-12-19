import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AmoCRMService, IFormData } from './services/amocrm.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const amoCrmService: AmoCRMService = new AmoCRMService();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware для проверки API ключа
// const apiKeyMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
//   const apiKey = req.headers['x-api-key'] as string;
//   const validKeys = process.env.API_KEYS?.split(',') || [];
  
//   if (!apiKey || !validKeys.includes(apiKey)) {
//     return res.status(401).json({
//       success: false,
//       error: 'Неверный или отсутствующий API ключ'
//     });
//   }
  
//   next();
// };

// Тестовый endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AmoCRM Integration Microservice',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      createLead: 'POST /api/leads',
      health: 'GET /health'
    }
  });
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'amocrm-service'
  });
});

// Основной endpoint для создания лида
app.post('/api/amo-crm', async (req, res) => {
  try {
    const { site_id, ...formData } = req.body;
    
    // Валидация
    
    if (!site_id) {
      return res.status(400).json({
        success: false,
        error: 'Параметр site_id обязателен'
      });
    }
    
    // Создание в AmoCRM
    // const result = await (amoCrmService as AmoCRMService).createContact(formData as IFormData, site_id);
    const result = await (amoCrmService as AmoCRMService).createLead(formData as IFormData, site_id);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
    
  } catch (error: any) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint для авторизации в AmoCRM (используется один раз для получения токенов)
// app.get('/auth', (req, res) => {
//   // Этот endpoint нужно будет доработать после настройки OAuth
//   res.json({
//     message: 'Для авторизации перейдите по ссылке',
//     authUrl: 'ЗДЕСЬ_БУДЕТ_ССЫЛКА' // Замените на реальную ссылку из amocrm.config.ts
//   });
// });

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ AmoCRM микросервис запущен на порту ${PORT}`);
  console.log(`🚀 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Документация: http://localhost:${PORT}`);
});

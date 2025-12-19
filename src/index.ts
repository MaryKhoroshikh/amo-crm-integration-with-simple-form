import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AmoCRMService, IFormData } from './services/amocrm.service';
import { validateFormData } from './utils/validators';

dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',       // React/Vue dev сервер
  'http://localhost:3001',
  // Добавьте сюда реальные домены для тестирования
];

const app = express();
const PORT = process.env.PORT || 3001;
const amoCrmService: AmoCRMService = new AmoCRMService();

app.use(cors({
  origin: function (origin, callback) {
    // Разрешить запросы без origin (например, из Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Запрос с запрещенного origin: ${origin}`);
      callback(new Error('CORS политика не разрешает запрос с этого домена'));
    }
  },
  credentials: false
}));
app.use(express.json());

// Middleware для проверки API ключа
const apiKeyMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!apiKey || !validKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Неверный API ключ'
    });
  }
  
  // Определяем, с какого сайта запрос
  let siteId = '';
  if (apiKey === process.env.SITE1_API_KEY) {
    siteId = process.env.SITE1_ID!;
  } else if (apiKey === process.env.SITE2_API_KEY) {
    siteId = process.env.SITE2_ID!;
  } else if (apiKey === process.env.SITE2_API_KEY) {
    siteId = process.env.SITE2_ID!;
  }
  
  // Сохраняем siteId для использования в обработчике
  (req as any).siteId = siteId;
  next();
};

// Тестовый endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AmoCRM Integration Microservice',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      createLead: 'POST /api/amo-crm',
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
app.post('/api/amo-crm', apiKeyMiddleware, async (req, res) => {
  try {
    const site_id = (req as any).siteId;
    const formData = req.body; // Только данные формы
    
    
    // Валидация
    
    // Проверка site_id
    if (!site_id) {
      return res.status(400).json({
        success: false,
        error: 'Site ID is required'
      });
    }
    
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Создание в AmoCRM
    const result = await (amoCrmService as AmoCRMService).createContactAndLead(formData as IFormData, site_id);
    
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

import dotenv from 'dotenv';
import { Client } from 'amocrm-js';

dotenv.config();

// Инициализируем клиент AmoCRM
const amoCrmClient = new Client({
    // логин пользователя в портале, где адрес портала domain.amocrm.ru
    domain: process.env.AMO_CRM_SUBDOMAIN || '', // может быть указан полный домен вида domain.amocrm.ru, domain.amocrm.com
    /* 
      Информация об интеграции (подробности подключения 
      описаны на https://www.amocrm.ru/developers/content/oauth/step-by-step)
    */
    auth: {
      client_id: process.env.AMO_CRM_CLIENT_ID || '', // ID интеграции
      client_secret: process.env.AMO_CRM_CLIENT_SECRET || '', // Секретный ключ
      redirect_uri: process.env.AMO_CRM_REDIRECT_URI || '', // Ссылка для перенаправления
      bearer: process.env.AMO_CRM_CLIENT_LTSTOKEN || '', // долгосрочный токен
    },
});

// Основная функция для получения готового к работе клиента
export async function getAmoCRMClient() {
  try {
    console.log('🔍 Debug: Анализ конфигурации AmoCRM...');
    
    // Логируем конфигурацию для диагностики
    console.log('📋 Конфигурация:');
    console.log('  - Subdomain:', process.env.AMO_CRM_SUBDOMAIN);
    console.log('  - Client ID:', process.env.AMO_CRM_CLIENT_ID ? 'Задан' : 'НЕ ЗАДАН');
    console.log('  - Client Secret:', process.env.AMO_CRM_CLIENT_SECRET ? 'Задан' : 'НЕ ЗАДАН');
    console.log('  - Redirect URI:', process.env.AMO_CRM_REDIRECT_URI);
    console.log('  - LTTOKEN:', process.env.AMO_CRM_CLIENT_LTSTOKEN ? 'Задан (длина: ' + process.env.AMO_CRM_CLIENT_LTSTOKEN.length + ')' : 'НЕ ЗАДАН');
    
    // Проверяем базовые поля конфигурации
    if (!process.env.AMO_CRM_SUBDOMAIN) {
      throw new Error('AMO_CRM_SUBDOMAIN не задан в переменных окружения');
    }
    
    if (!process.env.AMO_CRM_CLIENT_ID) {
      throw new Error('AMO_CRM_CLIENT_ID не задан в переменных окружения');
    }
    
    if (!process.env.AMO_CRM_CLIENT_SECRET) {
      throw new Error('AMO_CRM_CLIENT_SECRET не задан в переменных окружения');
    }
    
    if (!process.env.AMO_CRM_CLIENT_LTSTOKEN) {
      throw new Error('AMO_CRM_CLIENT_LTSTOKEN не задан в переменных окружения');
    }
    
    console.log('✅ Базовая конфигурация проверена');
    console.log('🔐 Попытка аутентификации с AmoCRM...');
    
    // Тестируем подключение
    const result = await amoCrmClient.request.make('GET', '/api/v4/account');    
    
    // HTTP-статус ответа операции
    console.log('✅ Успешная аутентификация! Статус:', result.response.statusCode);
    console.log('📊 Информация об аккаунте получена');
    
    return amoCrmClient;
    
  } catch (error: any) {
    console.error('❌ Ошибка при подключении к AmoCRM:');
    console.error('  - Тип ошибки:', error.constructor.name);
    console.error('  - Сообщение:', error.message);
    
    if (error.response) {
      console.error('  - HTTP статус:', error.response.statusCode);
      console.error('  - Ответ сервера:', error.response.data);
    }
    
    // Более детальная диагностика 401 ошибок
    if (error.response?.statusCode === 401) {
      console.error('🚨 ДИАГНОСТИКА 401 ОШИБКИ:');
      console.error('  Возможные причины:');
      console.error('  1. Истек или недействителен долгосрочный токен (LTTOKEN)');
      console.error('  2. Неверный subdomain:', process.env.AMO_CRM_SUBDOMAIN);
      console.error('  3. Неверные client_id или client_secret');
      console.error('  4. Интеграция не активирована в AmoCRM');
      console.error('  5. Недостаточно прав у интеграции');
      
      // Проверяем токен на истечение
      if (process.env.AMO_CRM_CLIENT_LTSTOKEN) {
        try {
          const tokenParts = process.env.AMO_CRM_CLIENT_LTSTOKEN.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            const expirationTime = payload.exp * 1000; //转换为毫秒
            const currentTime = Date.now();
            
            if (expirationTime < currentTime) {
              console.error('  🔍 ТОКЕН ИСТЕК!', {
                expirationTime: new Date(expirationTime).toISOString(),
                currentTime: new Date(currentTime).toISOString(),
                expiredMs: currentTime - expirationTime
              });
            } else {
              console.error('  ✅ Токен еще действителен до:', new Date(expirationTime).toISOString());
            }
          }
        } catch (e) {
          console.error('  ⚠️ Не удалось разобрать токен как JWT');
        }
      }
    }
    
    throw error;
  }
}

export default amoCrmClient;
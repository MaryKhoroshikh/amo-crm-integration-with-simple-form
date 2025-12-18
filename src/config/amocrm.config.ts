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
      bearer: 'ltsToken', // долгосрочный токен
    },
});

// Основная функция для получения готового к работе клиента
export async function getAmoCRMClient() {
  // Здесь будет логика получения/обновления токенов
  // Пока просто возвращаем клиента

  const result = await amoCrmClient.request.make('GET', '/api/v4/account');
    // возвращает тело ответа 
    console.log(result.data);
    /* 
    Возвращает расширенную информацию об ответе - 
    экземпляр http.IncomingMessage:
    https://nodejs.org/api/http.html#class-httpincomingmessage
    */
    console.log(result.response);
    // к примеру, HTTP-статус ответа операции
    console.log(result.response.statusCode);
    return amoCrmClient;
}

export default amoCrmClient;
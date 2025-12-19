require('dotenv').config();
import { AmoCRM } from 'amocrm-js';

const client = new AmoCRM({
    clientId: process.env.AMOCRM_CLIENT_ID,
    clientSecret: process.env.AMOCRM_CLIENT_SECRET,
    redirectUri: process.env.AMOCRM_REDIRECT_URI,
    subdomain: process.env.AMOCRM_SUBDOMAIN,
});

// Генерируем URL для авторизации
const authUrl = client.connection.getAuthUrl();
console.log('============================================');
console.log('1. Перейдите по этой ссылке в браузере:');
console.log(authUrl);
console.log('\n2. Разрешите доступ приложению.');
console.log('3. После согласия вас перебросит на адрес:');
console.log('   http://localhost:3001/auth/callback?code=...');
console.log('4. СКОПИРУЙТЕ значение параметра "code" из URL.');
console.log('   (Это длинная строка после "?code=")');
console.log('============================================');
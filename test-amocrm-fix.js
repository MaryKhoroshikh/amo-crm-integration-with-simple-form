// Тестовый скрипт для проверки исправления AmoCRM API
const { Client } = require('amocrm-js');

// Инициализация клиента (используем те же настройки что и в config)
const amoCrmClient = new Client({
    domain: 'goodmary1024',
    auth: {
        client_id: '1c1e0087-cf3a-4b42-bfac-a9e51fc27092',
        client_secret: 'txUtTrPU49NlfQTxYXuZhM5X1E0pyYrNpNXhbJXjdHAsaLQh1BTDlXn0viDfZdIu',
        redirect_uri: 'http://localhost:3001/auth/callback',
        bearer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImYzYmQyMGE2ZjcwYTQwYzdhZjY3ZmEyZDlmNzI5MTZkMzg1YmFiMzBlYzJhMzNkYjI5ODFkNzBjZjlkZGVlOGY3MmFlMjkxNThlNWYwMWI1In0.eyJhdWQiOiIxYzFlMDA4Ny1jZjNhLTRiNDItYmZhYy1hOWU1MWZjMjcwOTIiLCJqdGkiOiJmM2JkMjBhNmY3MGE0MGM3YWY2N2ZhMmQ5ZjcyOTE2ZDM4NWJhYjMwZWMyYTMzZGIyOTgxZDcwY2Y5ZGRlZThmNzJhZTI5MTU4ZTVmMDFiNSIsImlhdCI6MTc2NjEzNzE5MywibmJmIjoxNzY2MTM3MTkzLCJleHAiOjE3NjYyNzUyMDAsInN1YiI6IjEzMzM0OTYyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyODIwNTA2LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiZDg3ZThhZDItZGM3OS00YTc2LTkzYmUtODhmNjNmMTcyZmNmIiwidXNlcl9mbGFncyI6MCwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.fuqntYkxTNKFvQlkvLwiU_eehC65wY6YcGTWA_k0r578KUNGz0zz9YcD4D5K5NZyx52tM1lPRRd3NJq3d6eO1s3CKUArCx60tw4U2k7QaTA_A4xVQ7xSM6BKbrKk6fpfKaQ-BrWGd8CUpmE6e7fwkmIYrTgey983BOWjrS5DosxYSuBKGCYmF3ZVDtPtJUZpb0dJnkkrcRn5iQS5KBnMjjzetFmfjUrPcaz0USwW_RPBaejuOripOxW1Xr80CyrlfqKPSxFe83jpm4UlMl52vFLu9eQOOKFydnMJAlUZuDXrQ0wyhh9Sm1iQKhBm9tmZBc-60hitr7vhE52p4Oglcg',
    },
});

async function testContactCreation() {
    try {
        console.log('🔧 Тестирование исправленного AmoCRM API...');
        
        // Тестовые данные
        const testData = {
            name: 'Тест Пользователь',
            phone: '+7 (999) 123-45-67',
            email: 'test@example.com',
            company: 'Тестовая Компания'
        };
        
        // Разделяем имя
        const nameParts = testData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Создаем контакт
        const newContact = new amoCrmClient.Contact();
        newContact.first_name = firstName;
        newContact.last_name = lastName;
        
        // Формируем пользовательские поля в правильном формате
        const customFields = [];
        
        if (testData.email) {
            customFields.push({
                field_code: 'EMAIL',
                values: [{
                    value: testData.email
                }]
            });
        }
        
        if (testData.phone) {
            customFields.push({
                field_code: 'PHONE',
                values: [{
                    value: testData.phone
                }]
            });
        }
        
        // Убираем company_name пока, так как это может быть не стандартное поле
        // if (testData.company) {
        //     customFields.push({
        //         field_code: 'COMPANY_NAME',
        //         values: [{
        //             value: testData.company
        //         }]
        //     });
        // }
        
        if (customFields.length > 0) {
            newContact.custom_fields_values = customFields;
        }
        
        console.log('📋 Структура запроса:');
        console.log(JSON.stringify({
            first_name: newContact.first_name,
            last_name: newContact.last_name,
            custom_fields_values: newContact.custom_fields_values
        }, null, 2));
        
        // Сохраняем контакт
        await newContact.save();
        console.log('✅ Контакт успешно создан с ID:', newContact.id);
        
    } catch (error) {
        console.error('❌ Ошибка при создании контакта:', error.message);
        console.error('Детали ошибки:', error.response?.data);
    }
}

testContactCreation();
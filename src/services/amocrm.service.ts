import { getAmoCRMClient } from '../config/amocrm.config';

export interface IFormData {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  message?: string;
  task?: string;
}

export class AmoCRMService {
  async createContact(formData: IFormData, siteId: string): Promise<any> {
    try {
      const client = await getAmoCRMClient();

      // СОЗДАНИЕ И СОХРАНЕНИЕ КОНТАКТА
      // Разделяем полное имя на имя и фамилию (простая логика)
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Создаём новый экземпляр контакта
      const newContact = new client.Contact();

      // Устанавливаем основные поля
      newContact.first_name = firstName;
      newContact.last_name = lastName;
      
      // Формируем массив пользовательских полей в правильном формате AmoCRM
      const customFields: any[] = [];
      
      // Добавляем email, если он указан
      if (formData.email) {
        console.log(`📧 Добавляем email поле: ${formData.email}`);
        customFields.push({
          field_code: 'EMAIL', // Используем код поля вместо ID
          values: [{
            value: formData.email
          }]
        });
      }
      
      // Добавляем телефон, если он указан
      if (formData.phone) {
        console.log(`📱 Добавляем phone поле: ${formData.phone}`);
        customFields.push({
          field_code: 'PHONE', // Используем код поля вместо ID
          values: [{
            value: formData.phone
          }]
        });
      }
      
      // Добавляем компанию, если она указана
      if (formData.company) {
        customFields.push({
          field_id: 1053499,
          values: [{
            value: formData.company
          }]
        });
      }
      
      // Устанавливаем пользовательские поля
      if (customFields.length > 0) {
        newContact.custom_fields_values = customFields;
        // newLead.custom_fields_values = customFields;
      }

      // Сохраняем контакт в AmoCRM
      await newContact.save();

      // Возвращаем успешный результат
      return {
        success: true,
        contactId: newContact.id,
        message: `Контакт успешно создан в AmoCRM`
      };

    } catch (error: any) {
      console.error('❌ Ошибка в AmoCRMService:', error);
      return {
        success: false,
        error: error.message || 'Неизвестная ошибка при создании в AmoCRM',
        // Можно добавить больше деталей для отладки
        details: error.response?.data || null
      };
    }
  }
  async createLead(formData: IFormData, siteId: string): Promise<any> {
    try {
      const client = await getAmoCRMClient();

      // СОЗДАНИЕ И СОХРАНЕНИЕ СДЕЛКИ (по примеру из документации)
      const newLead = new client.Lead({
          name: formData.name
      });
      newLead.price = 0;
      
      // Формируем массив пользовательских полей в правильном формате AmoCRM
      const customFields: any[] = [];
      
      // Добавляем email, если он указан
      if (formData.email) {
        console.log(`📧 Добавляем email поле: ${formData.email}`);
        customFields.push({
          field_code: 'EMAIL', // Используем код поля вместо ID
          values: [{
            value: formData.email
          }]
        });
      }
      
      // Добавляем телефон, если он указан
      if (formData.phone) {
        console.log(`📱 Добавляем phone поле: ${formData.phone}`);
        customFields.push({
          field_code: 'PHONE', // Используем код поля вместо ID
          values: [{
            value: formData.phone
          }]
        });
      }
      
      // Добавляем компанию, если она указана
      if (formData.company) {
        customFields.push({
          field_id: 1053499,
          values: [{
            value: formData.company
          }]
        });
      }

      // Добавляем сообщение, если есть
      if (formData.message) {
        customFields.push({
          field_id: 1053503,
          values: [{
            value: formData.message
          }]
        });
      }
      
      // Устанавливаем пользовательские поля
      if (customFields.length > 0) {
        newLead.custom_fields_values = customFields;
      }

      // Сохраняем контакт в AmoCRM
      await newLead.save();

      // Возвращаем успешный результат
      return {
        success: true,
        newLeadId: newLead.id,
        message: `Сделка успешно создана в AmoCRM`
      };

    } catch (error: any) {
      console.error('❌ Ошибка в AmoCRMService:', error);
      return {
        success: false,
        error: error.message || 'Неизвестная ошибка при создании в AmoCRM',
        // Можно добавить больше деталей для отладки
        details: error.response?.data || null
      };
    }
  }
}
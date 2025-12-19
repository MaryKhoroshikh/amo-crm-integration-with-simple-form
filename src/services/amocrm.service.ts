import { getAmoCRMClient } from '../config/amocrm.config';

export interface IFormData {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  message?: string;
}

export class AmoCRMService {
  async createContactAndLead(formData: IFormData, siteId: string): Promise<any> {
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
      const customContactFields: any[] = [];
      
      // Добавляем email, если он указан
      if (formData.email) {
        customContactFields.push({
          field_code: 'EMAIL', // Используем код поля вместо ID
          values: [{
            value: formData.email
          }]
        });
      }
      
      // Добавляем телефон, если он указан
      if (formData.phone) {
        customContactFields.push({
          field_code: 'PHONE', // Используем код поля вместо ID
          values: [{
            value: formData.phone
          }]
        });
      }
      
      // Добавляем компанию, если она указана
      if (formData.company && process.env.AMO_CRM_COMPANY_FIELD_ID) {
        const companyFieldId = parseInt(process.env.AMO_CRM_COMPANY_FIELD_ID, 10);
        if (isNaN(companyFieldId)) {
          throw new Error('AMO_CRM_COMPANY_FIELD_ID must be a valid number');
        }
        customContactFields.push({
          field_id: companyFieldId,
          values: [{
            value: formData.company
          }]
        });
      }
      
      // Устанавливаем пользовательские поля
      if (customContactFields.length > 0) {
        newContact.custom_fields_values = customContactFields;
      }

      // Сохраняем контакт в AmoCRM
      await newContact.save();

      // СОЗДАНИЕ И СОХРАНЕНИЕ СДЕЛКИ (по примеру из документации)
      const newLead = new client.Lead({
          name: `Заявка с сайта ${siteId}`
      });
      newLead.price = 0;

      newLead.embeddedContacts.add([
        newContact
      ]);

      const customLeadFields: any[] = [];

      // Добавляем сообщение, если есть
      if (formData.message && process.env.AMO_CRM_MESSAGE_FIELD_ID) {
        const messageFieldId = parseInt(process.env.AMO_CRM_MESSAGE_FIELD_ID, 10);
        if (isNaN(messageFieldId)) {
          throw new Error('AMO_CRM_MESSAGE_FIELD_ID must be a valid number');
        }
        customLeadFields.push({
          field_id: messageFieldId,
          values: [{
            value: formData.message
          }]
        });
      }

      // Устанавливаем пользовательские поля
      if (customContactFields.length > 0) {
        newLead.custom_fields_values = customLeadFields;
      }

      // Сохраняем сделку в AmoCRM
      await newLead.save();

      // Возвращаем успешный результат
      return {
        success: true,
        contactId: newContact.id,
        //leadId: newLead.id,
        message: `Контакт и сделка успешно созданы в AmoCRM`
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
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

      // --- 1. СОЗДАНИЕ И СОХРАНЕНИЕ КОНТАКТА (по примеру из документации) ---
      // Разделяем полное имя на имя и фамилию (простая логика)
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Создаём новый экземпляр контакта
      const newContact = new client.Contact();

      // Устанавливаем основные поля
      newContact.first_name = firstName;
      newContact.last_name = lastName;

      // Сохраняем контакт в AmoCRM
      await newContact.save();
      console.log(`✅ Контакт создан с ID: ${newContact.id}`);

      // Возвращаем успешный результат
      return {
        success: true,
        contactId: newContact.id,
        message: 'Контакт успешно созданы в AmoCRM'
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
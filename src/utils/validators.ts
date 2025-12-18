import { IFormData } from '../services/amocrm.service';

export function validateFormData(data: IFormData): { isValid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Имя обязательно и должно содержать минимум 2 символа');
  }

  if (!data.phone || !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
    errors.push('Номер телефона обязателен и должен содержать только цифры и специальные символы');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Некорректный формат email');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

(function() {
  'use strict';
  
  // === КОНФИГУРАЦИЯ ДЛЯ САЙТА ===
  const CONFIG = {
    apiUrl: process.env.NODE_ENV === "development" ? 'http://localhost:3001/api/leads' : 'https://ваш-домен.com/api/leads',
    apiKey: 'site1_key_abc123', // Из .env бекенда
    siteName: 'Сайт 1'
  };
  
  // === ОСНОВНОЙ КОД ===
  document.addEventListener('DOMContentLoaded', function() {
    // Находим все формы на странице
    const forms = document.querySelectorAll('form[data-amocrm]');
    
    forms.forEach(form => {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = getFormData(this);
        
        // Валидация
        if (!validateFormData(formData)) {
          showMessage(this, 'error', 'Заполните обязательные поля: Имя и Телефон');
          return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        try {
          // Отправляем данные на бэкенд
          const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': CONFIG.apiKey
            },
            body: JSON.stringify(formData)
          });
          
          const result = await response.json();
          
          if (result.success) {
            showMessage(this, 'success', 'Заявка успешно отправлена!');
            this.reset(); // Очищаем форму
          } else {
            showMessage(this, 'error', result.error || 'Ошибка при отправке');
          }
        } catch (error) {
          showMessage(this, 'error', 'Ошибка соединения. Попробуйте позже.');
          console.error('Ошибка отправки:', error);
        } finally {
          // Восстанавливаем кнопку
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  });
  
  // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
  function getFormData(form) {
    const data = {};
    
    // Маппинг полей (настройте под вашу форму)
    const fields = {
      'name': form.querySelector('[name="name"], [name="fio"], .name-field'),
      'phone': form.querySelector('[name="phone"], [name="tel"], .phone-field'),
      'email': form.querySelector('[name="email"], .email-field'),
      'company': form.querySelector('[name="company"], .company-field'),
      'message': form.querySelector('[name="message"], [name="comment"], textarea')
    };
    
    Object.entries(fields).forEach(([key, element]) => {
      if (element && element.value) {
        data[key] = element.value.trim();
      }
    });
    
    return data;
  }
  
  function validateFormData(data) {
    return data.name && data.name.length >= 2 && data.phone;
  }
  
  function showMessage(form, type, text) {
    // Удаляем старые сообщения
    const oldMsg = form.querySelector('.amocrm-message');
    if (oldMsg) oldMsg.remove();
    
    // Создаём новое сообщение
    const message = document.createElement('div');
    message.className = `amocrm-message amocrm-${type}`;
    message.textContent = text;
    message.style.cssText = `
      padding: 10px 15px;
      margin: 10px 0;
      border-radius: 4px;
      font-size: 14px;
      ${type === 'success' ? 
        'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
        'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
    `;
    
    form.prepend(message);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => message.remove(), 5000);
  }
})();
import { create_order_API } from "../../api/api.js";
import { calculateCoursePrice, checkEarlyRegistration, isIntensiveCourse } from "./price-calculator.js";

// Создание уведомления
function showNotification(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white">
                <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
                <small class="text-white-50">just now</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body bg-light text-dark">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Удаляем toast после скрытия
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Подготовка данных заказа курса согласно требованиям API
function prepareCourseOrderData(courseInfo) {
    const form = document.getElementById('orderCourseForm');
    const formData = new FormData(form);
    
    // Получаем базовые данные из формы
    const data = {
        tutor_id: 0, // Для курсов всегда 0
        course_id: parseInt(formData.get('course_id')),
        date_start: formData.get('date_start') ,
        time_start: formData.get('time_start'),
        persons: parseInt(formData.get('persons')),
        price: parseInt(document.getElementById('course-price').textContent)
    };
    
    // Проверяем обязательные поля
    if (!data.course_id || data.course_id <= 0) {
        throw new Error('Course ID is required');
    }
    
    if (!data.date_start) {
        throw new Error('Start date is required');
    }
    
    if (!data.time_start) {
        throw new Error('Start time is required');
    }
    
    if (data.persons < 1 || data.persons > 20) {
        throw new Error('Number of students must be between 1 and 20');
    }
    
    if (data.price <= 0) {
        throw new Error('Price must be calculated first');
    }
    
    // Рассчитываем продолжительность в часах
    // Для курсов: total_length (недели) × week_length (часов в неделю)
    data.duration = parseInt(document.getElementById('courseDurationWeek-input').dataset.duration_hours)
    
    // Проверяем продолжительность (1-40 часов согласно API)
    if (data.duration < 1 || data.duration > 40) {
        throw new Error(`Duration (${data.duration} hours) must be between 1 and 40 hours`);
    }
    
    // Форматируем дату в YYYY-MM-DD
    if (data.date_start) {
        const date = new Date(data.date_start);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        data.date_start = date.toISOString().split('T')[0];
    }
    
    // Форматируем время в HH:MM
    if (data.time_start) {
        // Убедимся что время в правильном формате
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.time_start)) {
            throw new Error('Time must be in HH:MM format');
        }
    }
    
    // Дополнительные опции (boolean поля)
    const startDate = data.date_start;
    const persons = data.persons;

    const weekLength = parseInt(document.getElementById('weekLength-input').dataset.week_length);
    
    // Автоматические опции
    data.early_registration = checkEarlyRegistration(startDate);
    data.group_enrollment = persons >= 5;
    data.intensive_course = isIntensiveCourse(weekLength);
    
    // Пользовательские опции из чекбоксов
    data.supplementary = document.getElementById('supplementary-checkbox')?.checked || false;
    data.personalized = document.getElementById('personalized-checkbox')?.checked || false;
    data.excursions = document.getElementById('excursions-checkbox')?.checked || false;
    data.assessment = document.getElementById('assessment-checkbox')?.checked || false;
    data.interactive = document.getElementById('interactive-checkbox')?.checked || false;
    
    return data;
}

// Валидация формы перед отправкой
function validateFormBeforeSubmit() {
    const errors = [];
    
    // Проверяем, что цена рассчитана
    const price = document.getElementById('course-price').textContent;
    if (!price || price === '0 RUB' || price === '0') {
        errors.push('Please calculate the price first');
    }
    
    // Проверяем, что выбрана дата
    const dateSelect = document.getElementById('startDate-select');
    if (!dateSelect.value) {
        errors.push('Please select start date');
    }
    
    // Проверяем, что выбрано время
    const timeSelect = document.getElementById('timeStart-select');
    if (!timeSelect.value || timeSelect.disabled) {
        errors.push('Please select start time');
    }
    
    // Проверяем количество студентов
    const personsInput = document.getElementById('numberOfStudents-input');
    const persons = parseInt(personsInput.value) || 0;
    if (persons < 1 || persons > 20) {
        errors.push('Number of students must be between 1 and 20');
    }
    
    return errors;
}

// Обработка отправки формы заказа курса
async function handleCourseOrderSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submit-order-btn');
    
    // Получаем информацию о курсе из скрытых полей
    const courseId = document.getElementById('courseId-input').value;
    const courseInfo = {
        id: parseInt(courseId),
        name: document.getElementById('courseName-input').value,
        total_length: parseInt(document.getElementById('totalLength-input').dataset.total_length),
        week_length: parseInt(document.getElementById('weekLength-input').dataset.week_length)
    };
    
    // Валидация перед отправкой
    const validationErrors = validateFormBeforeSubmit();
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join('. '), 'error');
        return;
    }
    
    // Сохраняем оригинальный текст кнопки
    const originalText = submitBtn.textContent;
    
    // Показываем загрузку
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    try {
        // Подготавливаем данные согласно требованиям API
        const orderData = prepareCourseOrderData(courseInfo);
        
        console.log('Sending POST request with data:', orderData);
        
        // ВЫПОЛНЯЕМ POST-ЗАПРОС НА API
        const result = await create_order_API(orderData);
        
        console.log('POST request successful, response:', result);
        
        // Успех
        showNotification('Course order created successfully!', 'success');
        
        // Закрываем модальное окно
        const modalElement = document.getElementById('orderCourseModalWindow');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        // Сбрасываем форму
        form.reset();
        
        // Сбрасываем дополнительные поля
        document.getElementById('course-price').textContent = '0 RUB';
        document.getElementById('label-course-price').classList.add('hide');
        document.getElementById('price-details').classList.add('d-none');
        
        // Сбрасываем чекбоксы дополнительных опций
        const checkboxes = document.querySelectorAll('#additional-options input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Сбрасываем автоматические опции
        ['early-registration-info', 'group-discount-info', 'intensive-course-info'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('d-none');
        });
        
        // Обновляем список заказов в личном кабинете
        if (typeof window.updateOrdersTable === 'function') {
            window.updateOrdersTable();
        }
        
    } catch (error) {
        console.error('POST request failed:', error);
        showNotification(error.message || 'Failed to create order. Please check your data and try again.', 'error');
    } finally {
        // Восстанавливаем кнопку
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Инициализация обработчика заказов курсов
function initOrderHandler() {
    const orderForm = document.getElementById('orderCourseForm');
    if (orderForm) {
        // Удаляем старый обработчик если есть
        orderForm.removeEventListener('submit', handleCourseOrderSubmit);
        // Добавляем новый обработчик
        orderForm.addEventListener('submit', handleCourseOrderSubmit);
        console.log('Course order form handler initialized');
    }
    
    // Активация кнопки Submit при расчете стоимости
    const calculateBtn = document.getElementById('btn-get-price');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const submitBtn = document.getElementById('submit-order-btn');
            const price = document.getElementById('course-price').textContent;
            if (price && price !== '0 RUB' && price !== '0') {
                submitBtn.disabled = false;
            }
        });
    }
    
    // Сброс кнопки при изменении полей
    const formFields = ['startDate-select', 'timeStart-select', 'numberOfStudents-input'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', () => {
                document.getElementById('submit-order-btn').disabled = true;
                document.getElementById('label-course-price').classList.add('hide');
            });
        }
    });
    
    // Обработка изменения чекбоксов дополнительных опций
    const checkboxes = document.querySelectorAll('#additional-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // При изменении любой опции нужно пересчитать стоимость
            const calculateBtn = document.getElementById('btn-get-price');
            if (calculateBtn && !calculateBtn.disabled) {
                document.getElementById('submit-order-btn').disabled = true;
                const priceOutput = document.getElementById('course-price');
                if (priceOutput.textContent !== '0 RUB') {
                    // Триггерим клик для пересчета
                    const event = new Event('click');
                    calculateBtn.dispatchEvent(event);
                }
            }
        });
    });
}

export { initOrderHandler, showNotification };

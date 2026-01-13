import { create_order_API } from "../../api/api.js";
import { calculateCoursePrice, checkEarlyRegistration, isIntensiveCourse } from "./price-calculator.js";

  
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
    
      
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

  
function prepareCourseOrderData(courseInfo) {
    const form = document.getElementById('orderCourseForm');
    const formData = new FormData(form);
    
      
    const data = {
        tutor_id: 0,   
        course_id: parseInt(formData.get('course_id')),
        date_start: formData.get('date_start') ,
        time_start: formData.get('time_start'),
        persons: parseInt(formData.get('persons')),
        price: parseInt(document.getElementById('course-price').textContent)
    };
    
      
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
    
      
      
    data.duration = parseInt(document.getElementById('courseDurationWeek-input').dataset.duration_hours)
    
      
    if (data.duration < 1 || data.duration > 40) {
        throw new Error(`Duration (${data.duration} hours) must be between 1 and 40 hours`);
    }
    
      
    if (data.date_start) {
        const date = new Date(data.date_start);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        data.date_start = date.toISOString().split('T')[0];
    }
    
      
    if (data.time_start) {
          
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.time_start)) {
            throw new Error('Time must be in HH:MM format');
        }
    }
    
      
    const startDate = data.date_start;
    const persons = data.persons;

    const weekLength = parseInt(document.getElementById('weekLength-input').dataset.week_length);
    
      
    data.early_registration = checkEarlyRegistration(startDate);
    data.group_enrollment = persons >= 5;
    data.intensive_course = isIntensiveCourse(weekLength);
    
      
    data.supplementary = document.getElementById('supplementary-checkbox')?.checked || false;
    data.personalized = document.getElementById('personalized-checkbox')?.checked || false;
    data.excursions = document.getElementById('excursions-checkbox')?.checked || false;
    data.assessment = document.getElementById('assessment-checkbox')?.checked || false;
    data.interactive = document.getElementById('interactive-checkbox')?.checked || false;
    
    return data;
}

  
function validateFormBeforeSubmit() {
    const errors = [];
    
      
    const price = document.getElementById('course-price').textContent;
    if (!price || price === '0 RUB' || price === '0') {
        errors.push('Please calculate the price first');
    }
    
      
    const dateSelect = document.getElementById('startDate-select');
    if (!dateSelect.value) {
        errors.push('Please select start date');
    }
    
      
    const timeSelect = document.getElementById('timeStart-select');
    if (!timeSelect.value || timeSelect.disabled) {
        errors.push('Please select start time');
    }
    
      
    const personsInput = document.getElementById('numberOfStudents-input');
    const persons = parseInt(personsInput.value) || 0;
    if (persons < 1 || persons > 20) {
        errors.push('Number of students must be between 1 and 20');
    }
    
    return errors;
}

  
async function handleCourseOrderSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submit-order-btn');
    
      
    const courseId = document.getElementById('courseId-input').value;
    const courseInfo = {
        id: parseInt(courseId),
        name: document.getElementById('courseName-input').value,
        total_length: parseInt(document.getElementById('totalLength-input').dataset.total_length),
        week_length: parseInt(document.getElementById('weekLength-input').dataset.week_length)
    };
    
      
    const validationErrors = validateFormBeforeSubmit();
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join('. '), 'error');
        return;
    }
    
      
    const originalText = submitBtn.textContent;
    
      
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    try {
          
        const orderData = prepareCourseOrderData(courseInfo);
                
          
        const result = await create_order_API(orderData);
                
          
        showNotification('Course order created successfully!', 'success');
        
          
        const modalElement = document.getElementById('orderCourseModalWindow');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
          
        form.reset();
        
          
        document.getElementById('course-price').textContent = '0 RUB';
        document.getElementById('label-course-price').classList.add('hide');
        document.getElementById('price-details').classList.add('d-none');
        
          
        const checkboxes = document.querySelectorAll('#additional-options input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
          
        ['early-registration-info', 'group-discount-info', 'intensive-course-info'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('d-none');
        });
        
          
        if (typeof window.updateOrdersTable === 'function') {
            window.updateOrdersTable();
        }
        
    } catch (error) {
        console.error('POST request failed:', error);
        showNotification(error.message || 'Failed to create order. Please check your data and try again.', 'error');
    } finally {
          
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

  
function initOrderHandler() {
    const orderForm = document.getElementById('orderCourseForm');
    if (orderForm) {          
        orderForm.addEventListener('submit', handleCourseOrderSubmit);
        console.log('Course order form handler initialized');
    }
    
      
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
    
      
    const checkboxes = document.querySelectorAll('#additional-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
              
            const calculateBtn = document.getElementById('btn-get-price');
            if (calculateBtn && !calculateBtn.disabled) {
                document.getElementById('submit-order-btn').disabled = true;
                const priceOutput = document.getElementById('course-price');
                if (priceOutput.textContent !== '0 RUB') {
                      
                    const event = new Event('click');
                    calculateBtn.dispatchEvent(event);
                }
            }
        });
    });
}

export { initOrderHandler, showNotification };

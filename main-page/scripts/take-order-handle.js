import { create_order_API } from "/api/api.js";
import { showNotification } from "/main-page/scripts/order-handler.js";

  
function initTutorOrderHandler() {
    const tutorOrderForm = document.getElementById('orderTutorForm');
    if (tutorOrderForm) {
        tutorOrderForm.addEventListener('submit', handleTutorOrderSubmit);
    }
    
      
    const calculateTutorBtn = document.getElementById('btn-get-tutor-price');
    if (calculateTutorBtn) {
        calculateTutorBtn.addEventListener('click', calculateTutorPrice);
    }
    
      
    const tutorFields = ['tutorDate-input', 'tutorTime-select', 'tutorDuration-select', 'tutorNumberOfStudents-input'];
    tutorFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', () => {
                document.getElementById('submit-tutor-order-btn').disabled = true;
                document.getElementById('label-tutor-price').classList.add('hide');
            });
        }
    });
    
      
    const dateInput = document.getElementById('tutorDate-input');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}

  
function calculateTutorPrice() {
    const pricePerHour = parseInt(document.getElementById('tutorPricePerHour-input').value) || 0;
    const duration = parseInt(document.getElementById('tutorDuration-select').value) || 1;
    const persons = parseInt(document.getElementById('tutorNumberOfStudents-input').value) || 1;
    
    if (!pricePerHour) {
        showNotification('Please select a tutor first', 'error');
        return;
    }
    
      
    const totalPrice = pricePerHour * duration * persons;
    
    document.getElementById('tutor-price').textContent = `${totalPrice} RUB`;
    document.getElementById('label-tutor-price').classList.remove('hide');
    document.getElementById('submit-tutor-order-btn').disabled = false;
}

  
async function handleTutorOrderSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('#submit-tutor-order-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
          
        if (!data.date_start || !data.time_start) {
            throw new Error('Please select date and time');
        }
        
        if (!data.tutor_id || data.tutor_id === '0') {
            throw new Error('Please select a tutor');
        }
        
          
        data.tutor_id = parseInt(data.tutor_id);
        data.persons = parseInt(data.persons);
        data.duration = parseInt(data.duration);
        data.price = parseInt(document.getElementById('tutor-price').textContent) || 0;
        
          
        data.early_registration = false;
        data.group_enrollment = data.persons >= 5;
        data.intensive_course = false;
        data.supplementary = false;
        data.personalized = false;
        data.excursions = false;
        data.assessment = false;
        data.interactive = false;
        
          
        const result = await create_order_API(data);
        
          
        showNotification('Tutor session booked successfully!', 'success');
        
          
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderTutorModalWindow'));
        modal.hide();
        
          
        form.reset();
        
    } catch (error) {
        showNotification(error.message || 'Failed to book session', 'error');
        console.error('Tutor order error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Session';
    }
}

  
function openTutorOrderForm(tutor) {
    document.getElementById('tutorId-input').value = tutor.id;
    document.getElementById('tutorName-input').value = tutor.name;
    document.getElementById('tutorPricePerHour-input').value = tutor.price_per_hour;
    
      
    document.getElementById('tutor-price').textContent = '0 RUB';
    document.getElementById('label-tutor-price').classList.add('hide');
    document.getElementById('submit-tutor-order-btn').disabled = true;
    
      
    const dateInput = document.getElementById('tutorDate-input');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
    
      
    const modal = new bootstrap.Modal(document.getElementById('orderTutorModalWindow'));
    modal.show();
}

export { initTutorOrderHandler, openTutorOrderForm };

import { fetch_courses_API, fetch_specific_course_API } from "../../api/api.js";
import { calculateCoursePrice, checkEarlyRegistration, isIntensiveCourse } from "./price-calculator.js";

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 5;

 
function initSearch() {
    const searchInput = document.getElementById('course-search-input');
    const levelFilter = document.getElementById('course-level-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }
    
    if (levelFilter) {
        levelFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
}

 
export function applyFilters() {
    const searchTerm = document.getElementById('course-search-input')?.value.toLowerCase() || '';
    const levelFilter = document.getElementById('course-level-filter')?.value || 'All';
    
    filteredCourses = allCourses.filter(course => {
         
        const nameMatch = course.name.toLowerCase().includes(searchTerm) || 
                         course.teacher.toLowerCase().includes(searchTerm);
        
         
        const levelMatch = levelFilter === 'All' || course.level === levelFilter;
        
        return nameMatch && levelMatch;
    });
    
    currentPage = 1;
    displayCourses();
}

 
function createPagination() {
    const paginationContainer = document.getElementById('courses-pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <nav aria-label="Courses pagination">
            <ul class="pagination justify-content-center mb-0">
    `;
    
     
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    paginationHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" ${prevDisabled ? 'tabindex="-1"' : ''}>
                Previous
            </a>
        </li>
    `;
    
     
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
     
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
     
    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }
    
     
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
     
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }
    
     
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    paginationHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" ${nextDisabled ? 'tabindex="-1"' : ''}>
                Next
            </a>
        </li>
    `;
    
    paginationHTML += `
            </ul>
        </nav>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    
     
    paginationContainer.querySelectorAll('.page-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            if (page && page !== currentPage) {
                currentPage = page;
                displayCourses();
            }
        });
    });
}

 
function displayCourses() {
    const table = document.getElementById('courses-table-body');
    if (!table) return;
    
    table.innerHTML = '';
    
    if (filteredCourses.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 6;
        emptyCell.className = 'text-center py-4';
        emptyCell.textContent = 'No courses found';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        createPagination();
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredCourses.length);
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);
    
    for (const course of coursesToShow) {
        const tableRow = create_row_for_table(course);
        table.appendChild(tableRow);
    }
    createPagination();
}

 
function create_additional_options(checkboxName, checkboxId, labelText) {
    const container = document.createElement('div');
    container.className = 'form-check mb-2';
    
    const inputCheckbox = document.createElement('input');
    inputCheckbox.className = 'form-check-input';
    inputCheckbox.type = 'checkbox';
    inputCheckbox.id = checkboxId;
    inputCheckbox.name = checkboxName;
    
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = checkboxId;
    label.textContent = labelText;
    
    container.appendChild(inputCheckbox);
    container.appendChild(label);
    
    return container;
}

 
 
function write_available_dates_for_start_course(select_tag, start_dates) {
    select_tag.innerHTML = '<option value="">Choose start date</option>';
    const currentDate = new Date();
    
    const uniqueDates = new Set();
    start_dates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date > currentDate) {
            const dateOnly = date.toISOString().split('T')[0];
            uniqueDates.add(dateOnly);
        }
    });
    
     
    const sortedDates = Array.from(uniqueDates).sort();
    
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const option = document.createElement('option');
        option.value = dateStr;
        option.textContent = date;
        select_tag.appendChild(option);
    });
}

 
function calculateEndTime(startTime, weekLength) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationMinutes = weekLength * 60;  
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

 
function handleDateChange(courseInfo) {
    const dateSelect = document.getElementById('startDate-select');
    const timeSelect = document.getElementById('timeStart-select');
    
    if (!dateSelect || !timeSelect) return;
    
    dateSelect.addEventListener('change', function() {
        const selectedDate = this.value;
        timeSelect.innerHTML = '<option value="">Choose time</option>';
        timeSelect.disabled = !selectedDate;
        
        if (selectedDate) {
             
            const availableTimes = courseInfo.start_dates
                .filter(dateTime => {
                    const date = new Date(dateTime);
                    return date.toISOString().split('T')[0] === selectedDate;
                })
                .map(dateTime => {
                    const time = dateTime.split('T')[1].substring(0, 5);
                    const endTime = calculateEndTime(time, courseInfo.week_length);
                    return {
                        start: time,
                        end: endTime,
                        full: dateTime
                    };
                });
            
            if (availableTimes.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No times available for this date';
                timeSelect.appendChild(option);
                timeSelect.disabled = true;
            } else {
                timeSelect.disabled = false;
                availableTimes.forEach(timeSlot => {
                    const option = document.createElement('option');
                    option.value = timeSlot.start;
                    option.textContent = `${timeSlot.start} - ${timeSlot.end}`;
                    option.dataset.full = timeSlot.full;
                    timeSelect.appendChild(option);
                });
            }
        }
    });
}

 
function calculate_price_of_course(courseInfo) {
    const startDate = document.getElementById('startDate-select').value;
    const timeStart = document.getElementById('timeStart-select').value;
    const persons = parseInt(document.getElementById('numberOfStudents-input').value) || 1;
    
    if (!startDate || !timeStart) {
        showNotification('Please select start date and time', 'error');
        return null;
    }
    
     
    const options = {
        courseFeePerHour: courseInfo.course_fee_per_hour,
        week_length: courseInfo.week_length,
        total_length: courseInfo.total_length,
        startDate: startDate,
        timeStart: timeStart,
        persons: persons,
        earlyRegistration: checkEarlyRegistration(startDate),
        groupEnrollment: persons >= 5,
        intensiveCourse: isIntensiveCourse(courseInfo.week_length),
        supplementary: document.getElementById('supplementary-checkbox')?.checked || false,
        personalized: document.getElementById('personalized-checkbox')?.checked || false,
        excursions: document.getElementById('excursions-checkbox')?.checked || false,
        assessment: document.getElementById('assessment-checkbox')?.checked || false,
        interactive: document.getElementById('interactive-checkbox')?.checked || false
    };
    
    return calculateCoursePrice(courseInfo, options);
}

 
function showNotification(message, type = 'error') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white">
                <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
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

function getCoursePriceEvent(courseInfo) {
    const priceData = calculate_price_of_course(courseInfo);
    if (priceData) {
        const result_price = document.getElementById('course-price');
        result_price.textContent = `${priceData.total} RUB`;
        
        const priceDetails = document.getElementById('price-details');
        if (priceDetails) {
            priceDetails.innerHTML = `
                <div class="border-top pt-2 mt-2">
                    <p class="mb-1"><small>Base price: ${priceData.base} RUB</small></p>
                    <p class="mb-1"><small>Discount: ${priceData.discount} RUB</small></p>
                    <p class="mb-1"><small>Surcharge: ${priceData.surcharge} RUB</small></p>
                </div>
            `;
            priceDetails.classList.remove('d-none');
        }
        
        const earlyRegInfo = document.getElementById('early-registration-info');
        const groupDiscountInfo = document.getElementById('group-discount-info');
        const intensiveInfo = document.getElementById('intensive-course-info');
        
        if (earlyRegInfo) earlyRegInfo.classList.toggle('d-none', !checkEarlyRegistration(document.getElementById('startDate-select').value));
        if (groupDiscountInfo) groupDiscountInfo.classList.toggle('d-none', parseInt(document.getElementById('numberOfStudents-input').value) < 5);
        if (intensiveInfo) intensiveInfo.classList.toggle('d-none', !isIntensiveCourse(courseInfo.week_length));
        
        document.getElementById('label-course-price').classList.remove('hide');
        document.getElementById('submit-order-btn').disabled = false;
    }
}

async function callbackChooseCourse(event) {
    const sourceButtonEvent = event.currentTarget;
    const course_id = sourceButtonEvent.dataset.courseId;
    const course_info = await fetch_specific_course_API(course_id);
    
    // Заполняем поля формы
    document.getElementById('courseName-input').value = course_info.name;
    document.getElementById('teacherName-input').value = course_info.teacher;
    document.getElementById('courseDurationWeek-input').value = `${course_info.total_length} weeks (${course_info.week_length} hours/week)`;
    document.getElementById('courseDurationWeek-input').dataset.duration_hours = course_info.total_length * course_info.week_length;
    document.getElementById('courseDurationWeek-input').dataset.total_length - course_info.total_length;
    document.getElementById('courseDurationWeek-input').dataset.week_length = course_info.week_length
    document.getElementById('courseId-input').value = course_id;
    
    // Настраиваем даты и время
    const dateSelect = document.getElementById('startDate-select');
    write_available_dates_for_start_course(dateSelect, course_info.start_dates);
    handleDateChange(course_info);
    
    // Очищаем дополнительные опции
    const additionalOptions = document.getElementById('additional-options');
    if (additionalOptions) {
        additionalOptions.innerHTML = '';
        
        // Автоматические опции (только индикация)
        const autoOptions = document.createElement('div');
        autoOptions.className = 'mb-3';
        autoOptions.innerHTML = `
            <h6>Automatic Options:</h6>
            <div id="early-registration-indicator" class="d-none text-success">
                <i class="bi bi-check-circle"></i> Early registration discount (10%)
            </div>
            <div id="group-discount-indicator" class="d-none text-success">
                <i class="bi bi-check-circle"></i> Group enrollment discount (15%)
            </div>
            <div id="intensive-indicator" class="d-none text-warning">
                <i class="bi bi-exclamation-circle"></i> Intensive course surcharge (20%)
            </div>
        `;
        additionalOptions.appendChild(autoOptions);
        
        // Пользовательские опции
        const userOptions = document.createElement('div');
        userOptions.innerHTML = '<h6>Additional Options:</h6>';
        userOptions.appendChild(create_additional_options('supplementary', 'supplementary-checkbox', 'Supplementary materials (+2000 RUB per student)'));
        userOptions.appendChild(create_additional_options('personalized', 'personalized-checkbox', 'Personalized sessions (+1500 RUB per week)'));
        userOptions.appendChild(create_additional_options('excursions', 'excursions-checkbox', 'Cultural excursions (+25%)'));
        userOptions.appendChild(create_additional_options('assessment', 'assessment-checkbox', 'Language assessment (+300 RUB)'));
        userOptions.appendChild(create_additional_options('interactive', 'interactive-checkbox', 'Interactive platform (+50%)'));
        additionalOptions.appendChild(userOptions);
    }
    
    // Обновляем обработчик кнопки расчета
    const priceButton = document.getElementById('btn-get-price');
    priceButton.onclick = () => getCoursePriceEvent(course_info);
    
    // Сбрасываем поля
    document.getElementById('numberOfStudents-input').value = '1';
    document.getElementById('course-price').textContent = '0';
    document.getElementById('label-course-price').classList.add('hide');
    
    const priceDetails = document.getElementById('price-details');
    if (priceDetails) {
        priceDetails.classList.add('d-none');
    }
}

 
function create_button_to_select_course(course) {
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.dataset.courseId = course.id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#orderCourseModalWindow';
    btn.className = 'btn btn-success btn-sm';
    btn.addEventListener('click', callbackChooseCourse);
    return btn;
}

 
function create_row_for_table(course) {
    const tr = document.createElement('tr');
     
    const tdName = document.createElement('td');
    tdName.textContent = course.name;
    tr.appendChild(tdName);
    
     
    const tdTeacher = document.createElement('td');
    tdTeacher.textContent = course.teacher;
    tr.appendChild(tdTeacher);
    tr.dataset.teacher_name = course.teacher;
    
     
    const tdLevel = document.createElement('td');
    const levelBadge = document.createElement('span');
    levelBadge.className = `badge ${getLevelBadgeClass(course.level)}`;
    levelBadge.textContent = course.level;
    tdLevel.appendChild(levelBadge);
    tr.appendChild(tdLevel);
    
     
    const tdWeekLength = document.createElement('td');
    tdWeekLength.textContent = `${course.week_length} hours`;
    tr.appendChild(tdWeekLength);
    
     
    const tdPrice = document.createElement('td');
    tdPrice.textContent = `${course.course_fee_per_hour} RUB/hour`;
    tr.appendChild(tdPrice);
    
     
    const tdButton = document.createElement('td');
    tdButton.appendChild(create_button_to_select_course(course));
    tr.appendChild(tdButton);
    
    return tr;
}

 
function getLevelBadgeClass(level) {
    switch(level.toLowerCase()) {
        case 'beginner': return 'bg-success';
        case 'intermediate': return 'bg-warning text-dark';
        case 'advanced': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

 
async function main() {
    try {
        allCourses = await fetch_courses_API();
        filteredCourses = [...allCourses];
        
         
        initSearch();
        
         
        displayCourses();
        
    } catch (error) {
        console.error('Error loading courses:', error);
        const table = document.getElementById('courses-table-body');
        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        Error loading courses. Please try again later.
                    </td>
                </tr>
            `;
        }
    }
}

 
document.addEventListener('DOMContentLoaded', main);

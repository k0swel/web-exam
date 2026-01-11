import { fetch_courses_API, fetch_specific_course_API } from "../../api/api.js";
const result = await fetch_courses_API();


function create_additional_options(checkboxName, checkboxId, labelText) {
    const container = document.createElement('div');
    const inputCheckbox = document.createElement('input')
    inputCheckbox.classList.add('form-check-input');
    inputCheckbox.setAttribute('type', 'checkbox');
    inputCheckbox.id = checkboxId;
    inputCheckbox.name = checkboxName;
    container.appendChild(inputCheckbox);

    const label = document.createElement('label');
    label.classList.add('form-check-label');
    label.classList.add('for', checkboxId);
    label.textContent = labelText;

    container.appendChild(label);
                                //     <div class="form-check">
                                //     <input class="form-check-input" type="checkbox" id="checkbox1">
                                //     <label class="form-check-label" for="checkbox1">
                                //         Текст справа от чекбокса
                                //     </label>
                                // </div>
    return container;
}


function is_less_than_mounth(startDate) {
    // Функция проверяет записывается ли человек на курс за месяц заранее
    const currentDate = new Date();

    const startDate_course = new Date(startDate);

    return (startDate_course - currentDate) / 1000 / 3600 / 24 > 30;
}



function write_available_dates_for_start_course(select_tag, start_dates) {
    const currentDate = new Date();
    for (const start_date of start_dates) {
        if (currentDate > new Date(start_date) ) {
            continue;
        }
        const option = document.createElement('option');
        option.value = start_date;
        option.textContent = start_date;
        select_tag.appendChild(option);
    }
}

function write_duration_in_week(weeks_length) {
    const courseDurationWeekInput = document.getElementById('courseDurationWeek-input');
    courseDurationWeekInput.value = weeks_length;
}

function calculate_price_of_course() {
    const price = Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000;
    return price;
}

function getCoursePriceEvent(event) {
    const result_price = document.getElementById('course-price');
    result_price.textContent = `${calculate_price_of_course()} rubbles`;

    document.getElementById('label-course-price').classList.remove('hide');
}

async function callbackChooseCourse(event) {
    document.getElementById('btn-get-price').addEventListener('click', getCoursePriceEvent);

    const sourceButtonEvent = event.currentTarget;
    const course_id = sourceButtonEvent.dataset['courseId'];
    const course_info = await fetch_specific_course_API(course_id);
    const orderCourseModalWindow = document.getElementById('orderCourseModalWindow');
    write_available_dates_for_start_course(orderCourseModalWindow.querySelector('#startDate-select'), course_info['start_dates']);
    write_duration_in_week(course_info['week_length']);
    document.getElementById('courseName-input').value = course_info['name'];
    document.getElementById('teacherName-input').value = course_info['teacher'];
}

function create_button_to_select_course(table_row, course_id) {
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.setAttribute('data-course-id', course_id);
    btn.setAttribute('data-bs-toggle','modal');
    btn.setAttribute('data-bs-target', '#orderCourseModalWindow');
    btn.classList.add('btn', 'btn-success');
    btn.addEventListener('click', callbackChooseCourse);
    return btn;
}


function create_row_for_table(info, course_id) {
    const tr = document.createElement('tr');
    const btn = create_button_to_select_course(tr, course_id);
    for(let i = 0; i < 5; i++) {
        const td = document.createElement('td');
        td.textContent = info[i];
        tr.appendChild(td);
    }
    const td = document.createElement('td');
    td.appendChild(btn);
    tr.appendChild(td);
    return tr;
}

function main() {
    const table = document.getElementById('courses-table-body');
    for(const entry of result) {
        const table_row = create_row_for_table([entry['name'], entry['teacher'], entry['level'], entry['week_length'], entry['course_fee_per_hour'] ], entry['id']);
        table.appendChild(table_row);
    }
}

main()
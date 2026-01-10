import { fetch_courses_API, fetch_specific_course_API } from "../../api/api.js";
const result = await fetch_courses_API();


function write_available_dates_for_start_course(select_tag, start_dates) {
    for (const start_date of start_dates) {
        const option = document.createElement('option');
        option.value = start_date;
        option.textContent = start_date;
        select_tag.appendChild(option);
    }
}


async function callbackChooseCourse(event) {
    const sourceButtonEvent = event.currentTarget;
    const course_id = sourceButtonEvent.dataset['courseId'];
    const course_info = await fetch_specific_course_API(course_id);
    const orderCourseModalWindow = document.getElementById('orderCourseModalWindow');
    write_available_dates_for_start_course(orderCourseModalWindow.querySelector('#startDate-select'), course_info['start_dates']);

}

function create_button_to_select_course(table_row, course_id) {
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.setAttribute('data-course-id', course_id);
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
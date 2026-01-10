import { notifications } from './notifications.js';
var is_selected_course = false;
var selected_course_level = null;
const experience_input = document.getElementById('experience-input');


function toggleButton(action, button) {
    if (action == 'toselect') {
        button.classList.remove('btn-danger');
        button.classList.add('btn-success');
    }
    else if (action == 'tounselect') {
        button.classList.remove('btn-success');
        button.classList.add('btn-danger');
    }
}


function find_teachers_not_by_course(course_level) {
    const teachers_card = Array.from(document.getElementsByClassName('teacher-card-dummy'));
    const teacher_not_by_course_level = [];
    
    teachers_card.forEach((value) => {
        const teacher_courses = value.getAttribute('data-course-level').split(',');
        if (!teacher_courses.includes(course_level)) {
            teacher_not_by_course_level.push(value);
        }
    });
    
    return teacher_not_by_course_level;
}

function find_teachers_by_course(course_level) {
    const teachers_card = Array.from(document.getElementsByClassName('teacher-card-dummy'));
    const teacher_by_course_level = [];
    
    teachers_card.forEach((value) => {
        const teacher_courses = value.getAttribute('data-course-level').split(',');
        if (teacher_courses.includes(course_level)) {
            teacher_by_course_level.push(value);
        }
    });
    
    return teacher_by_course_level;
}

function resetExperienceFilter() {
    if (experience_input) {
        experience_input.value = "";
        
        const teacher_cards = Array.from(document.getElementsByClassName('teacher-card-dummy'));
        teacher_cards.forEach((card) => {
            if (!card.classList.contains('hide')) {
                card.classList.remove('hide');
            }
        });
    }
}

function main() {
    const buttonsInModalWindow = document.querySelectorAll('button[data-btn-type]');
    
    buttonsInModalWindow.forEach((element) => {
        element.addEventListener('click', (event) => {
            const btnType = element.getAttribute('data-btn-type');
            const btnCourse = document.getElementById(element.getAttribute('data-course-id'));
            const course_level = btnCourse.getAttribute('data-level');
            
            if (btnType == 'select' && is_selected_course == false) {
                element.setAttribute('data-btn-type', 'unselect');
                element.textContent = 'Cancel Select';
                toggleButton('tounselect', element);
                is_selected_course = true;
                selected_course_level = course_level;
                
                find_teachers_not_by_course(course_level).forEach((teacher) => {
                    teacher.classList.add('hide');
                });
                
                resetExperienceFilter();
                
            } else if (btnType == 'select' && is_selected_course == true) {
                notifications['404_course_already_chosed'].show();
                
            } else if (btnType == 'unselect' && is_selected_course == true) {
                element.setAttribute('data-btn-type', 'select');
                element.textContent = 'Select';
                toggleButton('toselect', element);
                is_selected_course = false;
                selected_course_level = null;
                
                const all_teachers = Array.from(document.getElementsByClassName('teacher-card-dummy'));
                all_teachers.forEach((teacher) => {
                    teacher.classList.remove('hide');
                });
                
                resetExperienceFilter();
            }
            
            btnCourse.classList.toggle('active-course');
        });
    });
}

main();
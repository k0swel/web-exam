import { notifications } from './notifications.js';

function toggleButton(action, button) {
    if (action == 'toselect') {
        button.classList.remove('btn-danger');
        button.classList.add('btn-success');
        button.textContent = 'Select';
    }
    else if (action == 'tounselect') {
        button.classList.remove('btn-success');
        button.classList.add('btn-danger');
        button.textContent = 'Cancel Select';
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

function resetExperienceFilter() {
    const experience_input = document.getElementById('experience-input');
    if (experience_input) {
        experience_input.value = "";
    }
}

function showAllTeachers() {
    const all_teachers = Array.from(document.getElementsByClassName('teacher-card-dummy'));
    all_teachers.forEach((teacher) => {
        teacher.classList.remove('hide');
    });
}

function main() {
    let selectedCourseId = null;
    let selectedCourseButton = null;
    
    const buttonsInModalWindow = document.querySelectorAll('button[data-btn-type]');
    
    buttonsInModalWindow.forEach((element) => {
        element.addEventListener('click', (event) => {
            const btnType = element.getAttribute('data-btn-type');
            const btnCourse = document.getElementById(element.getAttribute('data-course-id'));
            const course_level = btnCourse.getAttribute('data-level');
            
            if (btnType === 'select') {
                if (selectedCourseId && selectedCourseId !== btnCourse.id) {
                    notifications['course_already_selected'].show();
                    return;
                }
                
                element.setAttribute('data-btn-type', 'unselect');
                toggleButton('tounselect', element);
                selectedCourseId = btnCourse.id;
                selectedCourseButton = element;
                
                find_teachers_not_by_course(course_level).forEach((teacher) => {
                    teacher.classList.add('hide');
                });
                
                resetExperienceFilter();
                
                btnCourse.classList.add('active-course');
                
            } else if (btnType === 'unselect') {
                element.setAttribute('data-btn-type', 'select');
                toggleButton('toselect', element);
                selectedCourseId = null;
                selectedCourseButton = null;
                
                showAllTeachers();
                
                resetExperienceFilter();
                
                btnCourse.classList.remove('active-course');
            }
        });
    });
    
    const courseSelect = document.querySelector('.course-select');
    if (courseSelect) {
        courseSelect.addEventListener('change', () => {
            if (selectedCourseId) {
                if (selectedCourseButton) {
                    selectedCourseButton.click();
                }
            }
        });
    }
}

main();
import { notifications } from './notifications.js';

function toggleButton(action, button) {
    if (action === 'toselect') {
        button.classList.remove('btn-danger');
        button.classList.add('btn-success');
        button.textContent = 'Select';
        button.title = 'Select this course';
    } else if (action === 'tounselect') {
        button.classList.remove('btn-success');
        button.classList.add('btn-danger');
        button.textContent = 'Cancel Select';
        button.title = 'Cancel course selection';
    }
}

function main() {
    let selectedCourseId = null;
    let selectedCourseButton = null;
    
    document.addEventListener('click', (event) => {
        if (event.target.matches('.course-select-btn')) {
            const button = event.target;
            const courseId = button.dataset.courseId;
            
            if (button.dataset.selected === 'true') {
                button.dataset.selected = 'false';
                toggleButton('toselect', button);
                selectedCourseId = null;
                selectedCourseButton = null;
                
                const courseRow = button.closest('tr');
                if (courseRow) {
                    courseRow.classList.remove('table-primary');
                }
            } else {
                if (selectedCourseId && selectedCourseId !== courseId) {
                    notifications['course_already_selected'].show();
                    return;
                }
                
                button.dataset.selected = 'true';
                toggleButton('tounselect', button);
                selectedCourseId = courseId;
                selectedCourseButton = button;
                
                const courseRow = button.closest('tr');
                if (courseRow) {
                    courseRow.classList.add('table-primary');
                }
                
            }
        }
    });
    
    const courseSelect = document.querySelector('.course-select');
    if (courseSelect) {
        courseSelect.addEventListener('change', () => {
            if (selectedCourseButton) {
                selectedCourseButton.click();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', main);

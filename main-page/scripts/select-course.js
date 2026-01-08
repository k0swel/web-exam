import { notifications } from './notifications.js';
var is_selected_course = false;


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


function main() {
    const buttonsInModalWindow = document.querySelectorAll('button[data-btn-type]');
    buttonsInModalWindow.forEach(
        function(element) {
            element.addEventListener('click', 
                (event) => {
                    const btnType = element.getAttribute('data-btn-type');
                    const btnCourse = document.getElementById(element.getAttribute('data-course-id'));
                    console.log(btnCourse);
                    if (btnType == 'select' && is_selected_course == false) {
                        element.setAttribute('data-btn-type', 'unselect');
                        element.textContent = 'Cancel Select';
                        toggleButton('tounselect', element);
                        is_selected_course = true;
                    }
                    else if (btnType == 'select' && is_selected_course == true) {
                        notifications['404_course_already_chosed'].show();
                    }

                    if (btnType == 'unselect' && is_selected_course == true) {
                        element.setAttribute('data-btn-type', 'select');
                        element.textContent = 'Select';
                        toggleButton('toselect', element);
                        is_selected_course = false;
                    }
                    btnCourse.classList.toggle('active-course');

                }
            )
        }
    )
}

main()
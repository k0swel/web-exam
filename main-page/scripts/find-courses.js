function main() {
    const selector = document.querySelector('.form-select.course-select');
    const courses = document.querySelectorAll('.course.flex-nowrap');
    
    selector.addEventListener('change', function(event) {
        console.log(`Вы выбрали ${selector.value}`);
        
        const selectedCourse = document.querySelector('.course.active-course');
        
        if (selectedCourse && selector.value !== 'None') {
            const courseId = selectedCourse.id;
            const modalButton = document.querySelector(`button[data-course-id="${courseId}"]`);
            
            if (modalButton && modalButton.getAttribute('data-btn-type') === 'unselect') {
                modalButton.click();
            }
        }
        courses.forEach((element) => {
            const courseLevel = element.getAttribute('data-level'); 
            
            if (selector.value === 'None') {
                element.classList.remove('hide');
            } else if (courseLevel !== selector.value) {
                element.classList.add('hide');
            } else {
                element.classList.remove('hide');
            }
        });
    });
}

main();
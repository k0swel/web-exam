function main() {
    const selector = document.querySelector('.form-select.course-select');
    const courses = document.querySelectorAll('.course.flex-nowrap');
    
    console.dir(courses);
    
    selector.addEventListener('change', function(event) {
        console.log(`Вы выбрали ${selector.value}`);
        
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
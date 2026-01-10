function main() {
    const experience_input = document.getElementById('experience-input');
    
    experience_input.addEventListener('input', () => {
        const teacher_cards = Array.from(document.getElementsByClassName('teacher-card-dummy'));
        const inputValue = experience_input.value.trim();
        
        const selectedCourse = document.querySelector('.course.active-course');
        const selectedCourseLevel = selectedCourse ? selectedCourse.getAttribute('data-level') : null;
        
        teacher_cards.forEach((card) => {
            const experience = card.getAttribute('data-experience');
            const teacherCourses = card.getAttribute('data-course-level').split(',');
            
            let isVisible = true;
            
            if (selectedCourseLevel) {
                isVisible = teacherCourses.includes(selectedCourseLevel);
            }
            
            if (!isVisible) {
                card.classList.add('hide');
                return;
            }
                        if (inputValue === "") {
                card.classList.remove('hide');
                return;
            }
            
            // Проверяем опыт
            if (experience == inputValue) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    });
}

main();
function main() {
    const experience_input = document.getElementById('experience-input');
    
    experience_input.addEventListener('input', () => {
        const teacher_cards = Array.from(document.getElementsByClassName('teacher-card-dummy'));
        const inputValue = experience_input.value.trim();
        
        teacher_cards.forEach((card) => {
            const experience = card.getAttribute('data-experience');
            
            // Если поле ввода пустое
            if (inputValue === "") {
                // Проверяем, подходит ли преподаватель под выбранный курс
                // Нужно проверить все карточки, а не только видимые
                let shouldBeVisible = true;
                
                // Проверяем, есть ли выбранный курс
                const activeCourseBtn = document.querySelector('.course.active-course');
                if (activeCourseBtn) {
                    const selectedCourseLevel = activeCourseBtn.getAttribute('data-level');
                    const teacherCourses = card.getAttribute('data-course-level').split(',');
                    shouldBeVisible = teacherCourses.includes(selectedCourseLevel);
                }
                
                if (shouldBeVisible) {
                    card.classList.remove('hide');
                } else {
                    card.classList.add('hide');
                }
                return;
            }
            
            // Если есть значение в поле ввода
            // Сначала проверяем, подходит ли преподаватель под курс (если курс выбран)
            let isCourseCompatible = true;
            const activeCourseBtn = document.querySelector('.course.active-course');
            
            if (activeCourseBtn) {
                const selectedCourseLevel = activeCourseBtn.getAttribute('data-level');
                const teacherCourses = card.getAttribute('data-course-level').split(',');
                isCourseCompatible = teacherCourses.includes(selectedCourseLevel);
            }
            
            // Если преподаватель не подходит под курс, скрываем его
            if (!isCourseCompatible) {
                card.classList.add('hide');
                return;
            }
            
            // Если преподаватель подходит под курс, проверяем опыт
            if (experience == inputValue) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    });
}

main();
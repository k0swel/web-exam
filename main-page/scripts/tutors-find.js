function getFilterRequirements() {
    const qualification = document.getElementById('qualification-selector').value;
    const experience = document.getElementById('experience-filter').value;
    
    return {
        qualification: qualification,
        experience: experience ? parseInt(experience) : 0
    };
}

function main() {
    const btnFindTutors = document.getElementById('tutors-find');
    const tutors_table_body = document.getElementById('tutors-table-body');

    btnFindTutors.addEventListener('click', (event) => {
        event.preventDefault();
        
        const table_rows_array = Array.from(tutors_table_body.children);
        const filter_requirements = getFilterRequirements();
        
        table_rows_array.forEach(entry => {
            entry.classList.remove('hide');
            const entry_dataset = entry.dataset;
            
            const qualificationMatch = filter_requirements.qualification === 'All' || filter_requirements.qualification === entry_dataset.languageLevel;
            
            const experienceMatch = !filter_requirements.experience || parseInt(entry_dataset.workExperience) >= filter_requirements.experience;
            
            if (!qualificationMatch || !experienceMatch) {
                entry.classList.add('hide');
            }
        });
    });
    
    document.getElementById('experience-filter').addEventListener('input', () => {
        btnFindTutors.click();
    });
    
    document.getElementById('qualification-selector').addEventListener('change', () => {
        btnFindTutors.click();
    });
}

main();

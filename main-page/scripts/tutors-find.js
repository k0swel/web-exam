
function getFilterRequirements() {
    const filter = {'Qualification': document.getElementById('qualification-selector').value, 'Experience': document.getElementById('experience-filter').value}
    return filter;
}

function main() {
    const btnFindTutors = document.getElementById('tutors-find');
    const tutors_table_body = document.getElementById('tutors-table-body');


    btnFindTutors.addEventListener('click', (event) => {
        const table_rows_array = tutors_table_body.children;
        const filter_requirements = getFilterRequirements();
        console.log(filter_requirements);
        for (const entry of table_rows_array) {
            entry.classList.remove('hide');
            const entry_dataset = entry.dataset;
            console.log(entry_dataset);
            const requirement_one = filter_requirements['Qualification'] === entry_dataset['languageLevel'] || filter_requirements['Qualification'] === 'All';
            const requirement_two = Number(entry_dataset['workExperience']) >= filter_requirements['Experience'];

            console.log(requirement_one, requirement_two);

            if ( requirement_one && requirement_two == false) {
                entry.classList.add('hide');
            }
        }
    });
}

main();
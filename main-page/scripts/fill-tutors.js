import { fetch_tutors_API } from "/api/api.js"
import { applyFilters } from "/main-page/scripts/fill-courses.js";
const result = await fetch_tutors_API();

  
function create_button_to_select_tutor(tutor) {
    const btn = document.createElement('button');
    btn.textContent = 'Select';
    btn.classList.add('btn', 'btn-success', 'btn-sm');
    
    btn.dataset.selected = 'false';
    
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        const button = event.currentTarget;
        const isCurrentlySelected = button.dataset.selected === 'true';
        
        button.dataset.selected = (!isCurrentlySelected).toString();
        
        document.querySelectorAll('#tutors-table tbody tr').forEach(row => {
            row.classList.remove('table-primary');
        });
        
        const tableRow = button.closest('tr');
        if (button.dataset.selected === 'true') {
            tableRow.classList.add('table-primary');
        } else {
            tableRow.classList.remove('table-primary');
        }
        
        const courseRows = document.querySelectorAll('#courses-table-body tr');
        if (button.dataset.selected === 'true') {
            courseRows.forEach(element => {
                if (element.dataset.teacher_name !== tutor.name) {
                    element.classList.add('hide');
                } else {
                    element.classList.remove('hide');
                }
            });
        } else {
            courseRows.forEach(element => {
                element.classList.remove('hide');
            });
        }
        
        button.textContent = button.dataset.selected === 'true' ? 'Selected' : 'Select';
        if (button.textContent == 'Selected') {
            button.classList.remove('btn-success');
            button.classList.add('btn-secondary');
        }
        else if (button.textContent == 'Select') {
            button.classList.remove('btn-secondary');
            button.classList.add('btn-success');
        }
    });
    
    return btn;
}

  
function create_row_for_table(tutor) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-work-experience', tutor.work_experience);
    tr.setAttribute('data-language-level', tutor.language_level);
        
    const tdAvatar = document.createElement('td');
    const avatarImg = document.createElement('img');
    avatarImg.classList.add('table-avatar');
    avatarImg.src = './images/github_default_avatar.png';
    tdAvatar.appendChild(avatarImg);
    tr.appendChild(tdAvatar);  

    const tdName = document.createElement('td');
    tdName.textContent = tutor.name;
    tr.appendChild(tdName);
    
      
    const tdLevel = document.createElement('td');
    tdLevel.textContent = tutor.language_level;
    tr.appendChild(tdLevel);
    
      
    const tdLanguages = document.createElement('td');
    tdLanguages.textContent = Array.isArray(tutor.languages_spoken) 
        ? tutor.languages_spoken.join(', ')
        : tutor.languages_spoken;
    tr.appendChild(tdLanguages);
    
      
    const tdExperience = document.createElement('td');
    tdExperience.textContent = `${tutor.work_experience} years`;
    tr.appendChild(tdExperience);
    
      
    const tdPrice = document.createElement('td');
    tdPrice.textContent = `${tutor.price_per_hour} RUB/hour`;
    tr.appendChild(tdPrice);
    
      
    const tdButton = document.createElement('td');
    tdButton.appendChild(create_button_to_select_tutor(tutor));
    tr.appendChild(tdButton);
    
    return tr;
}

  
function main() {
    const table = document.getElementById('tutors-table-body');
    if (!table) return;
    
    table.innerHTML = '';
    
    if (result.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 6;
        emptyCell.className = 'text-center py-4';
        emptyCell.textContent = 'No tutors available';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        return;
    }
    
    for(const tutor of result) {
        const table_row = create_row_for_table(tutor);
        table.appendChild(table_row);
    }
}

main();

import { fetch_tutors_API } from "../../api/api.js"
const result = await fetch_tutors_API();


function create_button_to_select_tutor(table_row) {
    const btn = document.createElement('button');
    btn.textContent = 'Select';
    btn.classList.add('btn', 'btn-success');

    btn.addEventListener('click', (event) => {
        table_row.classList.toggle('table-success');
        console.log('append');
    });
    return btn;
}


function create_row_for_table(info, language_level) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-work-experience', info[3]);
    tr.setAttribute('data-language-level', language_level);
    console.log(info[2]);
    const btn = create_button_to_select_tutor(tr);
    for(let i = 0; i < 5; i++) {
        const td = document.createElement('td');
        td.textContent = info[i];
        tr.appendChild(td);
    }
    const td = document.createElement('td');
    td.appendChild(btn);
    tr.appendChild(td);
    return tr;
}

function main() {
    const table = document.getElementById('tutors-table-body');
    for(const entry of result) {
        const table_row = create_row_for_table([ entry['name'], entry['language_level'], entry['languages_spoken'], entry['work_experience'], entry['price_per_hour'] ], entry['language_level']);
        table.appendChild(table_row);
    }
}

main();
const API_KEY='?api_key=7642834c-48b2-4dda-8999-cb5e10f14d1d'


export async function fetch_tutors_API() {
    return fetch(`http://exam-api-courses.std-900.ist.mospolytech.ru/api/tutors${API_KEY}`).then(response => response.json());
}

export async function fetch_courses_API() {
    return fetch(`http://exam-api-courses.std-900.ist.mospolytech.ru/api/courses${API_KEY}`).then(response => response.json());
}

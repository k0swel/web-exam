const BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru';
const API_KEY = '7642834c-48b2-4dda-8999-cb5e10f14d1d';

async function makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    console.log(`Making ${method} request to: ${url}`);
    if (data && (method === 'POST' || method === 'PUT')) {
        console.log('Request payload:', data);
    }
    
    try {
        const response = await fetch(url, options);
        
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = { error: 'Failed to parse response' };
        }
        
        if (!response.ok) {
            console.error('API error response:', responseData);
            const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        console.log(`API ${method} request successful:`, responseData);
        return responseData;
        
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
    }
}

export async function fetch_courses_API() {
    return makeRequest('/api/courses');
}

export async function fetch_specific_course_API(course_id) {
    return makeRequest(`/api/courses/${course_id}`);
}

export async function fetch_tutors_API() {
    return makeRequest('/api/tutors');
}

export async function fetch_specific_tutor_API(tutor_id) {
    return makeRequest(`/api/tutors/${tutor_id}`);
}

export async function fetch_orders_API() {
    return makeRequest('/api/orders');
}

export async function fetch_specific_order_API(order_id) {
    return makeRequest(`/api/orders/${order_id}`);
}

export async function create_order_API(order_data) {
    const requiredFields = ['course_id', 'date_start', 'time_start', 'persons', 'price', 'duration'];
    const missingFields = requiredFields.filter(field => {
        if (field === 'course_id' && order_data.tutor_id) {
            return false;
        }
        return order_data[field] === undefined || order_data[field] === null || order_data[field] === '';
    });
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (order_data.persons < 1 || order_data.persons > 20) {
        throw new Error('Number of students must be between 1 and 20');
    }
    
    if (order_data.duration < 1 || order_data.duration > 40) {
        throw new Error('Duration must be between 1 and 40 hours');
    }
    
    if (order_data.price <= 0) {
        throw new Error('Price must be greater than 0');
    }
    
    if (order_data.course_id && order_data.tutor_id) {
        throw new Error('Cannot specify both course_id and tutor_id');
    }
    
    if (!order_data.course_id && !order_data.tutor_id) {
        throw new Error('Either course_id or tutor_id must be specified');
    }
    
    const booleanFields = [
        'early_registration',
        'group_enrollment',
        'intensive_course',
        'supplementary',
        'personalized',
        'excursions',
        'assessment',
        'interactive'
    ];
    
    booleanFields.forEach(field => {
        if (order_data[field] === undefined) {
            order_data[field] = false;
        }
        order_data[field] = Boolean(order_data[field]);
    });
    
    order_data.price = Math.round(parseFloat(order_data.price));
    
    console.log('Creating order with validated data:', order_data);
    return makeRequest('/api/orders', 'POST', order_data);
}

export async function update_order_API(order_id, order_data) {
    const dataToSend = {};
    
    const allowedFields = [
        'date_start', 'time_start', 'duration', 'persons', 'price',
        'early_registration', 'group_enrollment', 'intensive_course',
        'supplementary', 'personalized', 'excursions', 'assessment', 'interactive'
    ];
    
    allowedFields.forEach(field => {
        if (order_data[field] !== undefined) {
            dataToSend[field] = order_data[field];
        }
    });
    
    return makeRequest(`/api/orders/${order_id}`, 'PUT', dataToSend);
}

export async function delete_order_API(order_id) {
    return makeRequest(`/api/orders/${order_id}`, 'DELETE');
}

export async function get_course_name_by_id_API(courseId) {
    const courses = await makeRequest('/api/courses');
    for (const course of courses) {
        if (course.id == courseId)
            return course.name;
    }
}

export async function get_tutor_name_by_id_API(tutorId) {
    const tutors = await makeRequest('/api/tutors');
    for (const tutor of tutors) {
        if (tutor.id == tutorId)
            return tutor.name;
    }
}

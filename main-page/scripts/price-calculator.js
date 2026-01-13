export function calculateCoursePrice(course, options) {
    const {
        courseFeePerHour,
        week_length,
        total_length,
        startDate,
        timeStart,
        persons,
        earlyRegistration,
        groupEnrollment,
        intensiveCourse,
        supplementary,
        personalized,
        excursions,
        assessment,
        interactive
    } = options;
    
    const totalHours = week_length * total_length;
    let basePrice = courseFeePerHour * totalHours;
    
    const lessonDate = new Date(startDate);
    const dayOfWeek = lessonDate.getDay(); 
    const isWeekendOrHoliday = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1;
    basePrice *= isWeekendOrHoliday;
    
    const hour = parseInt(timeStart.split(':')[0]);
    let morningSurcharge = 0;
    let eveningSurcharge = 0;
    
    if (hour >= 9 && hour < 12) {
        morningSurcharge = 400;
    }
    if (hour >= 18 && hour < 20) {
        eveningSurcharge = 1000;
    }
    
    let totalPrice = (basePrice + morningSurcharge + eveningSurcharge) * persons;
    
    let discount = 0;
    let surcharge = 0;
    
    if (earlyRegistration) {
        discount += totalPrice * 0.10;
    }
    if (groupEnrollment && persons >= 5) {
        discount += totalPrice * 0.15;
    }
    
    if (intensiveCourse && week_length >= 5) {
        surcharge += totalPrice * 0.20;
    }
    if (supplementary) {
        surcharge += 2000 * persons;
    }
    if (personalized) {
        surcharge += 1500 * total_length;
    }
    if (excursions) {
        surcharge += totalPrice * 0.25;
    }
    if (assessment) {
        surcharge += 300;
    }
    if (interactive) {
        surcharge += totalPrice * 0.50;
    }
    
    totalPrice = totalPrice - discount + surcharge;
    
    return {
        total: Math.round(totalPrice),
        base: Math.round(basePrice * persons),
        discount: Math.round(discount),
        surcharge: Math.round(surcharge),
        details: {
            isWeekendOrHoliday,
            morningSurcharge,
            eveningSurcharge
        }
    };
}

export function checkEarlyRegistration(startDate) {
    const currentDate = new Date();
    const courseStartDate = new Date(startDate);
    const diffTime = courseStartDate - currentDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 30;
}

export function isIntensiveCourse(weekLength) {
    return weekLength >= 5;
}

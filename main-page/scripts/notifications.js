const option = {
    animation: true,   
    autohide: true,   
    delay: 3000,        
};

var toastElList = [].slice.call(document.querySelectorAll('.toast'));
var toastList = toastElList.map(function (toastEl) {
  let toast_el = new bootstrap.Toast(toastEl, option);
  return {
    show: function() { 
      toast_el.show(); 
    },
    hide: function() {
      toast_el.hide();
    }
  };
});

function createNewCourseToast() {
    const toastContainer = document.querySelector('.toast-container');
    
    const newToastHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header my-custom-toast-header">
                <strong class="me-auto">Course Selection</strong>
                <small class="text-muted">just now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body my-custom-toast-body">
                You have already selected a course. Please cancel your current selection before choosing another course.
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', newToastHTML);
    
    const newToastEl = toastContainer.lastElementChild;
    const newToast = new bootstrap.Toast(newToastEl, option);
    
    return {
        show: function() { 
            newToast.show(); 
        },
        hide: function() {
            newToast.hide();
        }
    };
}

const anotherCourseToast = createNewCourseToast();

export const notifications = {
    '404_course_already_chosed': anotherCourseToast, 
    'course_already_selected': anotherCourseToast,    
};
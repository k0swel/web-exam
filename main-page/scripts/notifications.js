
const option = {
    animation: true,   
    autohide: true,   
    delay: 3,        
};

var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  let toast_el = new bootstrap.Toast(toastEl, option);
  return {show: function() { toast_el.show(); setTimeout(() => toast_el.hide(), 3000)} };
})

export const notifications = {
    '404_course_already_chosed': toastList[0],
}
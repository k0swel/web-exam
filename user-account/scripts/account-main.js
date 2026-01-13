
import { fetch_orders_API, update_order_API, delete_order_API, get_course_name_by_id_API, get_tutor_name_by_id_API } from "../../api/api.js";
import { showNotification } from "../../main-page/scripts/order-handler.js";

let allOrders = [];
let currentPage = 1;
const itemsPerPage = 5;
let orderToDelete = null;

function createOrdersPagination() {
    const totalPages = Math.ceil(allOrders.length / itemsPerPage);
    const paginationContainer = document.getElementById('orders-pagination');
    
    if (!paginationContainer || totalPages <= 1) {
        return;
    }
    
    paginationContainer.innerHTML = '';
    
    const paginationUl = document.createElement('ul');
    paginationUl.className = 'pagination justify-content-center pagination-custom';
    
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.textContent = 'Previous';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayOrders();
        }
    });
    prevLi.appendChild(prevLink);
    paginationUl.appendChild(prevLi);
    
     
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        const firstLink = document.createElement('a');
        firstLink.className = 'page-link';
        firstLink.href = '#';
        firstLink.textContent = '1';
        firstLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = 1;
            displayOrders();
        });
        firstLi.appendChild(firstLink);
        paginationUl.appendChild(firstLi);
        
        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            const ellipsisLink = document.createElement('a');
            ellipsisLink.className = 'page-link';
            ellipsisLink.href = '#';
            ellipsisLink.textContent = '...';
            ellipsisLi.appendChild(ellipsisLink);
            paginationUl.appendChild(ellipsisLi);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displayOrders();
        });
        pageLi.appendChild(pageLink);
        paginationUl.appendChild(pageLi);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            const ellipsisLink = document.createElement('a');
            ellipsisLink.className = 'page-link';
            ellipsisLink.href = '#';
            ellipsisLink.textContent = '...';
            ellipsisLi.appendChild(ellipsisLink);
            paginationUl.appendChild(ellipsisLi);
        }
        
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        const lastLink = document.createElement('a');
        lastLink.className = 'page-link';
        lastLink.href = '#';
        lastLink.textContent = totalPages;
        lastLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = totalPages;
            displayOrders();
        });
        lastLi.appendChild(lastLink);
        paginationUl.appendChild(lastLi);
    }
    
     
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.textContent = 'Next';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displayOrders();
        }
    });
    nextLi.appendChild(nextLink);
    paginationUl.appendChild(nextLink);
    
    paginationContainer.appendChild(paginationUl);
}

 
function displayOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const ordersToShow = allOrders.slice(startIndex, endIndex);
    
    ordersToShow.forEach(async(order, index) => {
        const row = await createOrderRow(order, startIndex + index + 1);
        tableBody.appendChild(row);
    });
    
    createOrdersPagination();
}

async function createOrderRow(order, number) {
    const tr = document.createElement('tr');
    
    const tdNumber = document.createElement('td');
    tdNumber.textContent = number;
    tr.appendChild(tdNumber);
    
    const tdName = document.createElement('td');
    tdName.textContent = order.course_id ? `${await get_course_name_by_id_API(order.course_id)}` : `${await get_tutor_name_by_id_API(order.tutor_id)}`;
    tr.appendChild(tdName);
    
    const tdOrderDate = document.createElement('td');
    tdOrderDate.textContent = new Date(order.created_at).toLocaleDateString('ru-RU');
    tr.appendChild(tdOrderDate);
    
    const tdLessonDate = document.createElement('td');
    tdLessonDate.textContent = new Date(order.date_start).toLocaleDateString('ru-RU');
    tr.appendChild(tdLessonDate);
    
    const tdStatus = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge status-active';
    statusBadge.textContent = 'Active';
    tdStatus.appendChild(statusBadge);
    tr.appendChild(tdStatus);
    
    const tdPrice = document.createElement('td');
    tdPrice.textContent = `${order.price} RUB`;
    tr.appendChild(tdPrice);
    
    const tdActions = document.createElement('td');
    tdActions.className = 'action-buttons';
    
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'btn btn-sm btn-info';
    detailsBtn.innerHTML = '<i class="bi bi-info-circle"></i>';
    detailsBtn.title = 'View details';
    detailsBtn.addEventListener('click', () => showOrderDetails(order));
    tdActions.appendChild(detailsBtn);
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-warning';
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.title = 'Edit order';
    editBtn.addEventListener('click', () => editOrder(order));
    tdActions.appendChild(editBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.title = 'Delete order';
    deleteBtn.addEventListener('click', () => confirmDeleteOrder(order));
    tdActions.appendChild(deleteBtn);
    
    tr.appendChild(tdActions);
    return tr;
}

async function showOrderDetails(order) {
    try {
        document.getElementById('detailOrderId').textContent = order.id;
        document.getElementById('detailOrderDate').textContent = new Date(order.created_at).toLocaleString('ru-RU');
        document.getElementById('detailLessonDate').textContent = new Date(order.date_start).toLocaleString('ru-RU');
        
        let courseName = '-';
        let teacherName = '-';
        
        if (order.course_id) {
            courseName = await get_course_name_by_id_API(order.course_id);
            teacherName = await get_tutor_name_by_id_API(order.tutor_id);
            console.log(`$teacherName = ${teacherName}`);
        } 
        
        document.getElementById('detailCourseName').textContent = courseName;
        document.getElementById('detailTeacher').textContent = teacherName;
        
        const basePrice = order.price * 0.8; 
        const discount = order.early_registration ? basePrice * 0.1 : 0;
        const surcharge = order.personalized ? 1500 : 0;
        
        document.getElementById('detailBasePrice').textContent = Math.round(basePrice);
        document.getElementById('detailDiscount').textContent = discount;
        document.getElementById('detailSurcharge').textContent = surcharge;
        document.getElementById('detailTotalPrice').textContent = order.price;
        
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
        
    } catch (error) {
        showNotification('Failed to load order details', 'error');
        
        document.getElementById('detailOrderId').textContent = order.id;
        document.getElementById('detailCourseName').textContent = order.course_id ? `Course #${order.course_id}` : `Tutor #${order.tutor_id}`;
        document.getElementById('detailTeacher').textContent = 'Error loading';
        document.getElementById('detailOrderDate').textContent = new Date(order.created_at).toLocaleString('ru-RU');
        document.getElementById('detailLessonDate').textContent = new Date(order.date_start).toLocaleString('ru-RU');
        
        const basePrice = order.price; 
        const discount = order.early_registration ? basePrice * 0.1 : 0;
        const surcharge = order.personalized ? 1500 : 0;
        
        document.getElementById('detailBasePrice').textContent = Math.round(basePrice);
        document.getElementById('detailDiscount').textContent = Math.round(discount);
        document.getElementById('detailSurcharge').textContent = Math.round(surcharge);
        document.getElementById('detailTotalPrice').textContent = order.price;
        
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }
}

function editOrder(order) {
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editLessonDate').value = order.date_start;
    
    const modal = new bootstrap.Modal(document.getElementById('editOrderModal'));
    modal.show();
}

function confirmDeleteOrder(order) {
    orderToDelete = order;
    document.getElementById('deleteOrderNumber').textContent = `#${order.id}`;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

async function deleteOrder() {
    if (!orderToDelete) return;
    
    try {
        await delete_order_API(orderToDelete.id);
        showNotification('Order deleted successfully', 'success');
        
        await loadOrders();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        
    } catch (error) {
        showNotification('Failed to delete order', 'error');
        console.error('Delete error:', error);
    }
}

async function loadOrders() {
    try {
        allOrders = await fetch_orders_API();
        currentPage = 1;
        displayOrders();
        
        if (allOrders.length === 0) {
            const tableBody = document.getElementById('ordersTableBody');
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 7;
            emptyCell.className = 'text-center py-4';
            emptyCell.textContent = 'No orders found. Create your first order!';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
        }
        
    } catch (error) {
        showNotification('Failed to load orders', 'error');
        console.error('Load orders error:', error);
    }
}

async function initAccount() {
    await loadOrders();
    
    const ordersSection = document.getElementById('orders-table');
    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'orders-pagination';
    paginationDiv.className = 'mt-4';
    ordersSection.appendChild(paginationDiv);
    
    document.getElementById('saveEditBtn').addEventListener('click', async () => {
        const orderId = document.getElementById('editOrderId').value;
        const lessonDate = document.getElementById('editLessonDate').value;
        
        try {
            await update_order_API(orderId, {
                date_start: lessonDate,
            });
            
            showNotification('Order updated successfully', 'success');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
            modal.hide();
            
            await loadOrders();
            
        } catch (error) {
            showNotification('Failed to update order', 'error');
        }
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteOrder);
    
    const studentsInput = document.getElementById('numberOfStudents-input');
    if (studentsInput) {
        studentsInput.addEventListener('change', () => {
            const calculateBtn = document.getElementById('btn-get-price');
            if (calculateBtn) {
                calculateBtn.click();
            }
        });
    }
}

export function updateOrdersTable() {
    loadOrders();
}

document.addEventListener('DOMContentLoaded', initAccount);

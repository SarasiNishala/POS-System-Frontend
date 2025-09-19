// Show today’s date dynamically
const today = new Date();
const options = { year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', options);

// Initialize order items from localStorage
let orderItems = JSON.parse(localStorage.getItem("orderItems")) || [];

// Save order to localStorage
function saveOrder() {
  localStorage.setItem("orderItems", JSON.stringify(orderItems));
}

// Update item count
function updateItemCount() {
  const count = document.querySelectorAll("#orderTableBody tr").length;
  document.getElementById("itemCount").textContent = count.toString().padStart(2,'0');
}

// Render table
function renderTable() {
  const tbody = document.getElementById("orderTableBody");
  tbody.innerHTML = "";

  orderItems.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td><i class="fa-regular fa-trash-can text-secondary delete-row" style="cursor:pointer;"></i></td>
  <td contenteditable="true" class="item-cell">${item.name || ""}</td>
  <td contenteditable="true" class="code-cell">${item.code || ""}</td>
  <td contenteditable="true" class="serial-cell">${item.serial || ""}</td>
  <td class="price-cell">
    <input type="number" class="form-control form-control-sm price-input text-end" value="${item.price || ''}">
  </td>
  <td>
    <input type="number" class="form-control form-control-sm discount-input text-end" value="${item.discount || ''}">
  </td>
  <td class="dis-amount-cell">
    ${item.price && item.qty && item.discount ? ((item.price * item.qty * item.discount)/100).toFixed(2) : ''}
  </td>
  <td contenteditable="true" class="instock-cell">${item.instock || ""}</td>
  <td>
    <input type="number" class="form-control form-control-sm qty-input text-end" value="${item.qty || ''}">
  </td>
  <td class="total-cell">
    ${item.price && item.qty ? (item.price * item.qty).toFixed(2) : ''}
  </td>
`;

    tbody.appendChild(tr);

    // Input listeners
    const priceInput = tr.querySelector(".price-input");
    const qtyInput = tr.querySelector(".qty-input");
    const discountInput = tr.querySelector(".discount-input");

    priceInput.addEventListener("input", () => updateRow(index));
    qtyInput.addEventListener("input", () => updateRow(index));
    discountInput.addEventListener("input", () => updateRow(index));

    // Enter key on qty creates new empty row
    qtyInput.addEventListener("keydown", e => {
      if(e.key === "Enter") createEmptyRow(index + 1);
    });
  });

  updateItemCount();
}

// Update row values
function updateRow(index) {
  const row = document.getElementById("orderTableBody").children[index];
  const price = parseFloat(row.querySelector(".price-input").value) || 0;
  const qty = parseFloat(row.querySelector(".qty-input").value) || 0;
  const discount = parseFloat(row.querySelector(".discount-input").value) || 0;

  row.querySelector(".total-cell").textContent = (price * qty).toFixed(2);
  row.querySelector(".dis-amount-cell").textContent = ((price * qty * discount)/100).toFixed(2);

  orderItems[index].price = price;
  orderItems[index].qty = qty;
  orderItems[index].discount = discount;
  saveOrder();
}

// Create empty row
function createEmptyRow(position) {
  orderItems.splice(position, 0, { name: "", code: "", serial: "", price: "", discount: "", instock: "", qty: "" });
  saveOrder();
  renderTable();

  // Focus new row's Item cell
  const tbody = document.getElementById("orderTableBody");
  const itemCell = tbody.children[position].querySelector(".item-cell");
  if (itemCell) itemCell.focus();
}

// Delete row
document.getElementById("orderTableBody").addEventListener("click", e => {
  if(e.target.closest(".delete-row")){
    const rowIndex = Array.from(e.target.closest("tr").parentNode.children).indexOf(e.target.closest("tr"));
    orderItems.splice(rowIndex, 1);
    saveOrder();
    renderTable();
  }
});

// Add product from card click
document.querySelectorAll(".product-card").forEach(card => {
  card.addEventListener("click", () => {
    const name = card.dataset.name || "Product";
    const code = card.dataset.code || "#000";
    const serial = card.dataset.serial || "";
    const price = parseFloat(card.dataset.price) || 0;
    const instock = card.dataset.instock || 0;

    // Find first empty row
    const emptyIndex = orderItems.findIndex(item => !item.name && !item.code);

    if(emptyIndex !== -1){
      orderItems[emptyIndex] = { name, code, serial, price, discount: 0, instock, qty: 1 };
    } else {
      orderItems.push({ name, code, serial, price, discount: 0, instock, qty: 1 });
    }

    saveOrder();
    renderTable();

    // Focus + Select QTY input of newly added row
    const focusIndex = emptyIndex !== -1 ? emptyIndex : orderItems.length - 1;
    const qtyInput = document.getElementById("orderTableBody").children[focusIndex].querySelector(".qty-input");
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select(); // highlight value
    }
  });
});

// Clear all
document.getElementById("clearAllBtn").addEventListener("click", () => {
  orderItems = [];
  saveOrder();
  renderTable();
});

// Initial render
renderTable();

// Calculator popup
const popup = document.getElementById("calculatorPopup");
const calcBtn = document.querySelector(".btn-cal");

calcBtn.addEventListener("click", () => {
  popup.classList.remove("d-none"); // show popup
});

function closePopup() {
  popup.classList.add("d-none"); // hide popup
}

// Calculator functions
const display = document.getElementById('display');

function append(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = '';
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    display.value = eval(display.value.replace('÷', '/').replace('×', '*'));
  } catch {
    display.value = 'Error';
  }
}

function toggleFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen(); // Exit fullscreen
  } else {
    document.documentElement.requestFullscreen(); // Enter fullscreen
  }
}

 // Show Payment Method Modal
  // function showPaymentMethods() {
  //   const modal = new bootstrap.Modal(document.getElementById("paymentMethodModal"));
  //   modal.show();
  // }

  // // Open specific payment modal
  // function openPaymentModal(type) {
  //   // Hide payment method selection
  //   bootstrap.Modal.getInstance(document.getElementById("paymentMethodModal")).hide();

  //   // Open selected modal
  //   const modalId = {
  //     cash: "cashModal",
  //     card: "cardModal",
  //     cheque: "chequeModal",
  //     bank: "bankModal",
  //     credit: "creditModal",
  //     other: "otherModal"
  //   }[type];

  //   if (modalId) {
  //     const modal = new bootstrap.Modal(document.getElementById(modalId));
  //     modal.show();
  //   }
  // }

   // Show modal on Place Order
function showPaymentModal() {
  const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
  modal.show();
}

// Switch between payment fields
function showPaymentFields(type) {
  document.querySelectorAll(".payment-fields").forEach(el => el.classList.add("d-none"));
  document.getElementById(type + "Fields").classList.remove("d-none");
}

// Add payment to grid
function addPayment(method) {
  let amount = 0, details = "";

  switch(method) {
    case 'Cash':
      amount = document.getElementById("cashAmount").value;
      details = "Cash Payment";
      break;
    case 'Card':
      amount = document.getElementById("cardAmount").value;
      details = document.getElementById("cardType").value + " ****" + document.getElementById("cardLast4").value;
      break;
    case 'Cheque':
      amount = document.getElementById("chequeAmount").value;
      details = "Cheque #" + document.getElementById("chequeNo").value;
      break;
    case 'Bank':
      amount = document.getElementById("bankAmount").value;
      details = "Tx: " + document.getElementById("bankTx").value;
      break;
    case 'Credit':
      amount = document.getElementById("creditAmount").value;
      details = "Acc: " + document.getElementById("creditAcc").value;
      break;
    case 'Other':
      amount = document.getElementById("otherAmount").value;
      details = "Acc: " + document.getElementById("otherAcc").value;
      break;
  }

  if (!amount || amount <= 0) {
    alert("Enter valid amount!");
    return;
  }

  const tbody = document.querySelector("#paymentGrid tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${method}</td>
    <td>${details}</td>
    <td>Rs ${parseFloat(amount).toFixed(2)}</td>
    <td><button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()">Remove</button></td>
  `;

  tbody.appendChild(row);
}


// Importamos Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Configuración de Firebase (REEMPLAZA con tu configuración)
const firebaseConfig = {
    apiKey: "AIzaSyBv9SnFPVvRzILNVei5tNXDLakP1Kc045Y",
    authDomain: "first-apk-7c3f9.firebaseapp.com",
    projectId: "first-apk-7c3f9",
    storageBucket: "first-apk-7c3f9.firebasestorage.app",
    messagingSenderId: "1967851324",
    appId: "1:1967851324:web:f00cbc76c4df66ded54039"
};

// Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCollection = collection(db, "transacciones");

// Referencias al DOM
const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const balanceElement = document.getElementById("balance");
const errorMessage = document.getElementById("errorMessage");

let balance = 0; // Variable de saldo

// Función para calcular el saldo total
const calculateBalance = async () => {
    const snapshot = await getDocs(transactionsCollection);
    balance = 0;

    snapshot.docs.forEach(docSnap => {
        const transaction = docSnap.data();
        balance += transaction.type === "Ingreso" ? transaction.amount : -transaction.amount;
    });

    balanceElement.textContent = `Saldo: $${balance.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Función para agregar una transacción con validación de saldo
transactionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    if (description && amount) {
        if (type === "Gasto" && amount > balance) {
            errorMessage.textContent = "Saldo insuficiente para realizar esta transacción.";
            return;
        }

        await addDoc(transactionsCollection, { description, amount, type });
        transactionForm.reset();
        errorMessage.textContent = "";
    }
});

// Función para mostrar las transacciones en la tabla
onSnapshot(transactionsCollection, (snapshot) => {
    transactionList.innerHTML = "";
    balance = 0; // Reiniciamos balance antes de recalcular

    snapshot.docs.forEach((docSnap) => {
        const transaction = docSnap.data();
        balance += transaction.type === "Ingreso" ? transaction.amount : -transaction.amount;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.description}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.type}</td>
            <td><button class="delete-btn" data-id="${docSnap.id}">❌ Eliminar</button></td>
        `;
        transactionList.appendChild(row);
    });

    balanceElement.textContent = `Saldo: $${balance.toFixed(2)}`;

    // Agregar eventos de eliminación
    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const transactionId = e.target.getAttribute("data-id");
            if (confirm("¿Deseas eliminar esta transacción?")) {
                await deleteDoc(doc(db, "transacciones", transactionId));
            }
        });
    });
});
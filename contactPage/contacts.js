document.addEventListener("DOMContentLoaded", () => { 
        document.getElementById('addBtn').addEventListener("click", openAddWindow);
        document.getElementById('closeBtn').addEventListener("click", closeAddWindow);
});

function openAddWindow(){
    document.getElementById(`addWindow`).classList.remove('dp-none')
}

function closeAddWindow(){
    document.getElementById(`addWindow`).classList.add('dp-none')
}
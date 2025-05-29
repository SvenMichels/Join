function checkBoxCheck() {
    let checkBoxRef = document.getElementById('checkBox');
    let signUp = document.getElementById('signUpBtn');
            signUp.disabled = true;
            signUp.style.color = '#9e9e9e';

    checkBoxRef.addEventListener('change', (event) => {
        if (checkBoxRef.checked) {
            signUp.disabled = false;
            signUp.style.color = 'white';
        } else {
            signUp.disabled = true;
            signUp.style.color = '#9e9e9e';
        }
    });
}

checkBoxCheck();

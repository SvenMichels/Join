  const input = document.getElementById('titleInput');
  const error = document.querySelector('.error-message');

  input.addEventListener('input', () => {
    if (input.validity.valid) {
      error.style.display = 'none';
    } else {
      error.style.display = 'block';
    }
  });
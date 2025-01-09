document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
                return response.text();
            })
            .then((data) => {
                alert(data); // Show success message
            })
            .catch((error) => {
                alert(`Error: ${error.message}`); // Show error message
            });
    });
});

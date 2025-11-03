import RegisterPresenter from "./register-presenter";

export default class RegisterPage {
  constructor() {
    this._presenter = new RegisterPresenter({ view: this });
  }

  async render() {
    return `
            <section class="container auth-page-container">
                <h2>Register</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" minlength="8" required>
                    </div>
                    <button type="submit">Register</button>
                    <div id="form-message"></div>
                </form>
                <p>Already have an account? <a href="#/login">Login here</a></p>
            </section>
        `;
  }

  async afterRender() {
    this._presenter.init();
  }

  initForm(registerCallback) {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      registerCallback(name, email, password);
    });
  }

  showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('form-message');
    messageContainer.textContent = message;

    if (type === true) {
      messageContainer.className = 'error';
    } else if (type === 'success') {
      messageContainer.className = 'success';
    } else {
      messageContainer.className = 'info';
    }
    messageContainer.style.display = 'block';
  }

  clearForm() {
    document.getElementById('register-form').reset();
  }
}

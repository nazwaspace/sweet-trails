import LoginPresenter from "./login-presenter";

export default class LoginPage {
  constructor() {
    this._presenter = new LoginPresenter({ view: this });
  }

  async render() {
    return `
            <section class="container auth-page-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Login</button>
                    <div id="form-message"></div>
                </form>
                <p>Don't have an account yet? <a href="#/register">Register here</a></p>
            </section>
        `;
  }

  async afterRender() {
    this._presenter.init();
  }

  initForm(loginCallback) {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      loginCallback(email, password);
    });
  }

  showMessage(message, isError = false) {
    const messageContainer = document.getElementById('form-message');
    messageContainer.textContent = message;

    let className = 'info';
    if (isError === true) {
      className = 'error';
    } else if (isError === false) {
      className = 'success';
    }

    messageContainer.className = className;
    messageContainer.style.display = 'block';
  }
}

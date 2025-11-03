import ApiService from '../../services/api-service';
import AuthService from '../../services/auth-service';

export default class LoginPresenter {
    constructor({ view }) {
        this._view = view;
        this._api = ApiService;
        this._auth = AuthService;
    }

    async init() {
        this._view.initForm(this._handleLogin.bind(this));
    }

    async _handleLogin(email, password) {
        if (!email || !password) {
            this._view.showMessage('Email and password must be filled.', true);
            return;
        }

        this._view.showMessage('Loading...', 'info');

        try {
            const response = await this._api.login({ email, password });
            if (response.error) {
                throw new Error(response.message);
            }

            this._auth.setToken(response.loginResult.token);
            this._view.showMessage('Login success!');
            location.hash = '#/';
        } catch (error) {
            this._view.showMessage(`Error: ${error.message}`, true);
        }
    }
}
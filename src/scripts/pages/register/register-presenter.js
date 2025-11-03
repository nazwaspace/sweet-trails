import ApiService from "../../services/api-service";

export default class RegisterPresenter {
    constructor({ view }) {
        this._view = view;
        this._api = ApiService;
    }

    async init() {
        this._view.initForm(this._handleRegister.bind(this));
    }

    async _handleRegister(name, email, password) {
        if (!name || !email || !password) {
            this._view.showMessage('Name, email, and password must be filled.', true);
            return;
        }
        if (password.length < 8) {
            this._view.showMessage('Password must be at least 8 characters long.', true);
            return;
        }

        this._view.showMessage('Loading...', 'info');

        try {
            const response = await this._api.register({ name, email, password });
            if (response.error) {
                throw new Error(response.message);
            }

            this._view.showMessage('Registration is complete! Please login.', 'success');
            this._view.clearForm();
        } catch (error) {
            this._view.showMessage(`Error: ${error.message}`, true);
        }
    }
}
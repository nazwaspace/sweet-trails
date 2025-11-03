const AuthService = {
  setToken(token) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};

export default AuthService;

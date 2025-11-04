import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import AuthService from '../services/auth-service';
import PushNotificationHelper from '../utils/push-notification-helper';
import CONFIG from '../config';
import ApiService from '../services/api-service';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #loginMenu = null;
  #logoutMenu = null;
  #logoutButton = null;
  #drawerLogoutButton = null;
  #currentPage = null;
  #pushToggleButton = null;
  #drawerPushToggleButton = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#loginMenu = document.querySelector('#login-menu');
    this.#logoutMenu = document.querySelector('#logout-menu');
    this.#logoutButton = document.querySelector('#logout-button');
    this.#drawerLogoutButton = document.querySelector('#drawer-logout-button');
    this.#pushToggleButton = document.querySelector('#push-toggle-button');
    this.#drawerPushToggleButton = document.querySelector('#drawer-push-toggle-button');

    this._setupDrawer();
    this._setupAuthMenu();
    this._setupLogoutButton();
    this._setupPushNotificationToggle();
    this.#currentPage = null;
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupAuthMenu() {
    const isLoggedIn = AuthService.isLoggedIn();
    const drawerLoginMenu = document.querySelector('#drawer-login-menu');
    const drawerLogoutMenu = document.querySelector('#drawer-logout-menu');

    if (this.#loginMenu && this.#logoutMenu) {
        this.#loginMenu.style.display = isLoggedIn ? 'none' : 'block';
        this.#logoutMenu.style.display = isLoggedIn ? 'block' : 'none';
    }

    if (drawerLoginMenu && drawerLogoutMenu) {
        drawerLoginMenu.style.display = isLoggedIn ? 'none' : 'block';
        drawerLogoutMenu.style.display = isLoggedIn ? 'block' : 'none';
    }

    this._showPushToggleButton(isLoggedIn);
  }

  _showPushToggleButton(isLoggedIn) {
    if (this.#pushToggleButton && this.#drawerPushToggleButton) {
      const display = isLoggedIn ? 'block' : 'none';
      this.#pushToggleButton.style.display = display;
      this.#drawerPushToggleButton.style.display = display;
    }
  }

  async _setupPushNotificationToggle() {
    const updateButtonState = (isSubscribed) => {
      [this.#pushToggleButton, this.#drawerPushToggleButton].forEach(button => {
        if (button) {
          if (isSubscribed) {
            button.textContent = '🔕 Unsubscribe';
            button.classList.add('subscribed');
          } else {
            button.textContent = '🔔 Subscribe';
            button.classList.remove('subscribed');
          }
        }
      });
    };

    const handleToggle = async () => {
      const isSubscribed = await PushNotificationHelper.isSubscribed();
      if (isSubscribed) {
        const subscription = await PushNotificationHelper.getSubscription();
        if (subscription) {
          try {
            const response = await ApiService.unsubscribePush(subscription);
            const responseJson = await response.json();
            
            if (responseJson.error) {
              throw new Error(responseJson.message);
            }
            console.log('Successfully unsubscribed from push server.');
            
          } catch (error) {
            console.error('Failed to send unsubscribe to server:', error);
          }
        }
        await PushNotificationHelper.unsubscribe();
        updateButtonState(false);
      } else {
        const subscription = await PushNotificationHelper.subscribe(CONFIG.VAPID_PUBLIC_KEY);
        if (subscription) {
          try {
            const response = await ApiService.subscribePush(subscription);
            const responseJson = await response.json();

            if (responseJson.error) {
              throw new Error(responseJson.message);
            }
            
            console.log('Successfully subscribed to push server.');
            updateButtonState(true);
          } catch (error) {
            console.error('Failed to send subscription to server:', error);
            await PushNotificationHelper.unsubscribe();
            updateButtonState(false);
            alert('Failed to subscribe. Please try again.');
          }
        }
      }
    };

    if (navigator.serviceWorker && 'PushManager' in window) {
      PushNotificationHelper.isSubscribed().then(updateButtonState);
    }

    if (this.#pushToggleButton) {
      this.#pushToggleButton.addEventListener('click', handleToggle);
    }
    if (this.#drawerPushToggleButton) {
      this.#drawerPushToggleButton.addEventListener('click', handleToggle);
    }
  }

  _setupLogoutButton() {
    const handleLogout = () => {
      AuthService.removeToken();
      this._setupAuthMenu();
      this.#navigationDrawer.classList.remove('open');
      location.hash = '#/login';
    };

    if (this.#logoutButton) {
        this.#logoutButton.addEventListener('click', handleLogout);
    }
    
    if (this.#drawerLogoutButton) {
        this.#drawerLogoutButton.addEventListener('click', handleLogout);
    }
  }

  _setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.#content.focus();
    });
  }

  async renderPage() {
     if (this.#currentPage && typeof this.#currentPage._destroy === 'function') {
      this.#currentPage._destroy();
    }

    const url = getActiveRoute();
    const publicRoutes = ['/', '/about', '/login', '/register'];
    const authRoutes = ['/', '/add'];
    const isLoggedIn = AuthService.isLoggedIn();

    if (authRoutes.includes(url) && !isLoggedIn) {
      location.hash = '#/login';
      return;
    }

    if ((url === '/login' || url === '/register') && isLoggedIn) {
      location.hash = '#/';
      return;
    }

    this._setupAuthMenu();

    const page = routes[url] || routes['/'];
    this.#currentPage = page;

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this._setupSkipLink();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._setupSkipLink();
    }
  }
}

export default App;

import HomePresenter from './home-presenter';
import ApiService from '../../services/api-service';
import DbHelper from '../../utils/db-helper'; 
import { showFormattedDate } from '../../utils';

export default class HomePage {
  constructor() {
    this._presenter = new HomePresenter({
      view: this,
      api: ApiService,
    });
  }

  async render() {
    return `
      <section class="container">
        <h2 class="container-title">Story List</h2>
        <div id="loading-indicator" class="loading" style="display: none;">Loading...</div>
        <div id="error-message" class="error" style="display: none;"></div>
        <div class="home-layout">
          <div id="story-list" class="story-list" tabindex="0" aria-label="Story List"></div>
          <div class="map-container">
            <div id="map"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._presenter.showStories();
  }

  showLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
  }

  showError(message) {
    const errorContainer = document.getElementById('error-message');
    errorContainer.style.display = 'block';
    errorContainer.textContent = message;
    if (message.includes('Token')) {
      errorContainer.innerHTML =
        'Your session has ended. Please <a href="#/login">Log back in</a>.';
    }
  }

  renderStories(stories) {
    const storyListContainer = document.getElementById('story-list');
    storyListContainer.innerHTML = '';

    if (stories.length === 0) {
      storyListContainer.innerHTML = '<p>There is no story yet.</p>';
      return;
    }

    stories.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.className = 'story-item';
      storyItem.dataset.id = story.id;
      storyItem.dataset.lat = story.lat;
      storyItem.dataset.lon = story.lon;
      storyItem.tabIndex = 0;
      storyItem.setAttribute('role', 'button');
      storyItem.setAttribute('aria-label', `See the story ${story.name}`);

      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Story photo by ${story.name}"> <h3>${story.name}</h3>
        <p>${story.description.substring(0, 100)}...</p>
        <small>Created on: ${showFormattedDate(story.createdAt)}</small>
        <button class="like-button" data-id="${story.id}" aria-label="Add ${story.name} to likes">
          Like ❤️
        </button>
      `;

      const handleItemClick = () => {
        this._presenter.highlightStory(story.id, story.lat, story.lon);
      };

      storyItem.addEventListener('click', handleItemClick);
      storyItem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleItemClick();
        }
      });

      storyListContainer.appendChild(storyItem);

      const likeButton = storyItem.querySelector('.like-button');
      this._updateLikeButtonText(likeButton, story.id); 
      
      likeButton.addEventListener('click', async (event) => {
        event.stopPropagation(); 
        await this._toggleLike(story, likeButton);
      });
    });
  }

  async _toggleLike(story, button) {
    const id = story.id;
    if (await DbHelper.getLikedStory(id)) {
      await DbHelper.deleteLikedStory(id);
      button.innerHTML = 'Like ❤️';
      button.setAttribute('aria-label', `Add ${story.name} to likes`);
    } else {
      await DbHelper.addLikedStory(story);
      button.innerHTML = 'Unlike 💔';
      button.setAttribute('aria-label', `Remove ${story.name} from likes`);
    }
  }
  
  async _updateLikeButtonText(button, id) {
    if (await DbHelper.getLikedStory(id)) {
      button.innerHTML = 'Unlike 💔';
    } else {
      button.innerHTML = 'Like ❤️';
    }
  }

  highlightListItem(id) {
    document.querySelectorAll('.story-item').forEach((item) => {
      item.classList.remove('highlighted');
      if (item.dataset.id === id) {
        item.classList.add('highlighted');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}

import DbHelper from '../../utils/db-helper';
import { showFormattedDate } from '../../utils';

export default class LikedPage {
  constructor() {
    this._allLiked = [];
  }

  async render() {
    return `
      <section class="container">
        <h1 class="container-title">Your Liked Stories</h1> <div class="form-group" style="max-width: 600px; margin: 20px auto;">
          <label for="search-bar">Search by Name</label>
          <input type="search" id="search-bar" placeholder="Type a name to filter...">
        </div>
        
        <div id="liked-list" class="story-list" tabindex="0" aria-label="Liked Story List"> <p>Loading liked stories...</p> </div>
      </section>
    `;
  }

  async afterRender() {
    await this._loadLikedStories(); 

    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', (event) => {
      this._filterAndRenderStories(event.target.value);
    });
  }

  async _loadLikedStories() { 
    try {
      this._allLiked = await DbHelper.getAllLikedStories(); 
      this._filterAndRenderStories('');
    } catch (error) {
      this._renderError('Failed to load liked stories. ' + error.message);
    }
  }

  _filterAndRenderStories(searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filteredStories = this._allLiked.filter(story =>
      story.name.toLowerCase().includes(lowerCaseSearch)
    );
    this._renderList(filteredStories);
  }

  _renderError(message) {
    const listContainer = document.getElementById('liked-list');
    listContainer.innerHTML = `<p class="error">${message}</p>`;
  }

  _renderList(stories) {
    const listContainer = document.getElementById('liked-list');
    listContainer.innerHTML = '';

    if (stories.length === 0) {
      listContainer.innerHTML = '<p>No liked stories found.</p>';
      return;
    }

    stories.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.className = 'story-item';
      storyItem.tabIndex = 0;

      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Story photo by ${story.name}">
        <h2>${story.name}</h2>
        <p>${story.description.substring(0, 100)}...</p>
        <small>Created on: ${showFormattedDate(story.createdAt)}</small>
        <button class="remove-like-button" data-id="${story.id}" aria-label="Remove ${story.name} from likes"> Unlike 💔
        </button>
      `;
      listContainer.appendChild(storyItem);
    });

    listContainer.querySelectorAll('.remove-like-button').forEach(button => {
      button.addEventListener('click', async (event) => {
        const id = event.target.dataset.id;
        await this._removeLikedStory(id);
      });
    });
  }

  async _removeLikedStory(id) {
    try {
      await DbHelper.deleteLikedStory(id);
      
      await this._loadLikedStories(); 
      
      const searchTerm = document.getElementById('search-bar').value;
      this._filterAndRenderStories(searchTerm);
    } catch (error) {
      alert('Failed to remove like: ' + error.message);
    }
  }
}
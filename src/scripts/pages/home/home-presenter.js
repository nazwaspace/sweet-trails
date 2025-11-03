import 'leaflet';
import CONFIG from '../../config';

const customStoryIcon = L.icon({
  iconUrl: 'images/marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -42],
});

export default class HomePresenter {
  constructor({ view, api }) {
    this._view = view;
    this._api = api;
    this._map = null;
    this._markers = {};
  }

  async showStories() {
    this._view.showLoading();
    try {
      const response = await this._api.getStories();
      if (response.error) {
        throw new Error(response.message);
      }
      this._view.renderStories(response.listStory);
      this._initMap(response.listStory);
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }

  _initMap(stories = []) {
    this._map = L.map('map').setView([-6.2088, 106.8456], 5);

    const mainLayer = L.tileLayer(CONFIG.MAP_TILE_LAYER_URL, {
      attribution: CONFIG.MAP_ATTRIBUTION,
    }).addTo(this._map);

    const satelliteLayer = L.tileLayer(CONFIG.MAP_SATELLITE_LAYER_URL, {
      attribution: CONFIG.MAP_SATELLITE_ATTRIBUTION,
    });

    const baseMaps = {
      Street: mainLayer,
      Satellite: satelliteLayer,
    };

    L.control.layers(baseMaps).addTo(this._map);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon], {
          icon: customStoryIcon,
        }).addTo(this._map).bindPopup(`
                        <b>${story.name}</b><br>
                        ${story.description.substring(0, 30)}...
                    `);

        marker.on('click', () => {
          this.highlightStory(story.id, story.lat, story.lon);
        });

        this._markers[story.id] = marker;
      }
    });
  }

  highlightStory(id, lat, lon) {
    this._view.highlightListItem(id);

    if (this._map && this._markers[id]) {
      const marker = this._markers[id];
      this._map.flyTo([lat, lon], 13);
      marker.openPopup();
    }
  }
}

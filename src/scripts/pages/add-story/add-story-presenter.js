import 'leaflet';

const customStoryIcon = L.icon({
  iconUrl: 'images/marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -42],
});

export default class AddStoryPresenter {
  constructor({ view, api }) {
    this._view = view;
    this._api = api;
    this._map = null;
    this._marker = null;
    this._photoBlob = null;
  }

  initForm() {
    this._initMap();

    document.getElementById('camera-button').addEventListener('click', () => {
      this._view.initCameraStream();
    });

    document
      .getElementById('snap-button')
      .addEventListener('click', async () => {
        this._photoBlob = await this._view.takeSnapshot();

        document.getElementById('photo').value = '';
      });

    document
      .getElementById('add-story-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();
        await this._handleSubmit();
      });

    document.getElementById('photo').addEventListener('change', () => {
      this._photoBlob = null;
      this._view.stopCameraStream();
    });
  }

  _initMap() {
    this._map = L.map('location-map').setView([-6.2088, 106.8456], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    this._map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('latitude').value = lat;
      document.getElementById('longitude').value = lng;
      document.getElementById('location-display').textContent =
        `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      if (this._marker) {
        this._marker.setLatLng(e.latlng);
      } else {
        this._marker = L.marker(e.latlng, { icon: customStoryIcon }).addTo(
          this._map,
        );
      }
    });
  }

  destroyMap() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }

  async _handleSubmit() {
    const formData = this._view.getFormData();

    const photoFile = formData.photoInput.files[0];
    const photoToUpload = this._photoBlob || photoFile;
    const photoName = this._photoBlob ? 'camera-shot.jpg' : photoFile.name;

    if (
      !formData.description ||
      !photoToUpload ||
      !formData.latitude
    ) {
      this._view.showMessage(
        'Validation Failed: Description, photo, and location in map must be filled.',
        true,
      );
      return;
    }

    const data = new FormData();
    data.append('description', formData.description);
    data.append('lat', formData.latitude);
    data.append('lon', formData.longitude);
    data.append('photo', photoToUpload, photoName);

    this._view.showMessage('Uploading story...');
    document.getElementById('submit-button').disabled = true;

    try {
      const response = await this._api.addStory(data);
      if (response.error) {
        throw new Error(response.message);
      }
      this._view.showMessage('Story uploaded successfully!');
      this._view.clearForm();
      this._photoBlob = null;
      location.hash = '#/';
    } catch (error) {
      this._view.showMessage(`Error: ${error.message}`, true);
    } finally {
      document.getElementById('submit-button').disabled = false;
    }
  }
}

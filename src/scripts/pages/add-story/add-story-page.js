import AddStoryPresenter from './add-story-presenter';
import ApiService from '../../services/api-service';

export default class AddStoryPage {
  constructor() {
    this._presenter = new AddStoryPresenter({
      view: this,
      api: ApiService,
    });
    this._stream = null;
  }

  async render() {
    return `
            <section class="container">
                <h1 class="container-title">Add New Story</h1>
                <form id="add-story-form" novalidate>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" rows="5" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="camera-button">Picture</label>
                        <button type="button" id="camera-button" class="secondary">Open Camera</button>
                        <div id="camera-container" style="display: none;">
                            <video id="camera-video" autoplay muted playsinline></video>
                            <button type="button" id="snap-button">Take Picture</button>
                        </div>
                        <canvas id="camera-canvas" style="display: none;"></canvas>
                        <img id="image-preview" src="#" alt="Image Preview" style="display: none; max-width: 100%; margin-top: 10px;">
                    </div>

                    <div class="form-group" id="file-upload-group">
                        <label for="photo">... or Upload a File</label>
                        <input type="file" id="photo" accept="image/*" required>
                    </div>

                    <div class="form-group">
                        <h2 id="location-label">Location (Click on the Map)</h2>
                        <div id="location-map" role="application" aria-labelledby="location-label" tabindex="0"></div>
                        <input type="hidden" id="latitude" readonly>
                        <input type="hidden" id="longitude" readonly>
                        <p id="location-display">Location has not been selected</p>
                    </div>
                    
                    <button type="submit" id="submit-button">Upload Story</button>
                    <div id="form-message"></div>
                </form>
            </section>
        `;
  }

  async afterRender() {
    this._presenter.initForm();
  }

  _destroy() {
    this.stopCameraStream();
    if (this._presenter) {
      this._presenter.destroyMap();
    }
  }

  getFormData() {
    return {
      description: document.getElementById('description').value,
      photoInput: document.getElementById('photo'),
      latitude: document.getElementById('latitude').value,
      longitude: document.getElementById('longitude').value,
    };
  }

  showMessage(message, isError = false) {
    const messageContainer = document.getElementById('form-message');
    messageContainer.textContent = message;
    messageContainer.className = isError ? 'error' : 'success';
  }

  clearForm() {
    document.getElementById('add-story-form').reset();
    document.getElementById('location-display').textContent =
      'Location has not been selected';
    document.getElementById('image-preview').style.display = 'none';
    this.stopCameraStream();
  }

  async initCameraStream() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const video = document.getElementById('camera-video');
      video.srcObject = this._stream;
      document.getElementById('camera-container').style.display = 'block';
      document.getElementById('file-upload-group').style.display = 'none';
      document.getElementById('image-preview').style.display = 'none';
    } catch (err) {
      this.showMessage('Cannot access camera', true);
    }
  }

  takeSnapshot() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('image-preview');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    preview.src = canvas.toDataURL('image/jpeg');
    preview.style.display = 'block';

    this.stopCameraStream();
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
  }

  stopCameraStream() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
      document.getElementById('camera-container').style.display = 'none';
      document.getElementById('file-upload-group').style.display = 'block';
    }
  }
}

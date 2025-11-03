import { openDB } from 'idb';

const DB_NAME = 'sweet-trails-db';
const LIKED_STORE_NAME = 'liked_stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(LIKED_STORE_NAME)) {
      db.createObjectStore(LIKED_STORE_NAME, { keyPath: 'id' });
    }
  },
});

const DbHelper = {
  async init() {
    return dbPromise;
  },
  
  async addLikedStory(story) {
    const db = await dbPromise;
    return db.put(LIKED_STORE_NAME, story);
  },

  async getAllLikedStories() {
    const db = await dbPromise;
    return db.getAll(LIKED_STORE_NAME);
  },

  async deleteLikedStory(id) {
    const db = await dbPromise;
    return db.delete(LIKED_STORE_NAME, id);
  },
  
  async getLikedStory(id) {
    const db = await dbPromise;
    return db.get(LIKED_STORE_NAME, id);
  }
};

export default DbHelper;
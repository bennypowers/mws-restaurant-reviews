// ES modulified version of idb-keyVal by Jake Archibald.
var db;

function getDB() {
  if (!db) {
    db = new Promise((resolve, reject) => {
      const openreq = indexedDB.open('keyval-store', 1);
      openreq.onerror = () => reject(openreq.error);
      // First time setup: create an empty object store
      openreq.onupgradeneeded = () => openreq.result.createObjectStore('keyval');
      openreq.onsuccess = () => resolve(openreq.result);
    });
  }
  return db;
}

async function withStore(type, callback) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('keyval', type);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    callback(transaction.objectStore('keyval'));
  });
}

export default class idbKeyval {

  static get(key) {
    return withStore('readonly', store => store.get(key)).then(req => req.result);
  }

  static set(key, value) {
    return withStore('readwrite', store => store.put(value, key));
  }

  static delete(key) {
    return withStore('readwrite', store => store.delete(key));
  }

  static clear() {
    return withStore('readwrite', store => store.clear());
  }

  static async keys() {
    let keys = [];
    await withStore('readonly', store => {
      // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
      // And openKeyCursor isn't supported by Safari.
      (store.openKeyCursor || store.openCursor).call(store).onsuccess = () => {
        if (!this.result) return;
        keys.push(this.result.key);
        this.result.continue();
      };
    });
    return keys;
  }
}

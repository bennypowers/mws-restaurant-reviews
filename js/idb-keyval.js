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

export const get = key => {
  let req;
  return withStore('readonly', store => {
    req = store.get(key);
  }).then(() => req.result);
};

const put = (key, value) => store => store.put(value, key);
export const set = (key, value) =>
  withStore('readwrite', put(key, value));

const _del = key => store => store.delete(key);
export const del = key =>
  withStore('readwrite', _del(key));

const _clear = store => store.clear();
export const clear = () =>
  withStore('readwrite', _clear);

export const keys = async () => {
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
};

export default {
  clear,
  del,
  get,
  keys,
  set,
};

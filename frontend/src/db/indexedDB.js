// indexedDB.js

const dbName = "userCredentials";
const dbVersion = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => {
      const newRequest = indexedDB.open(dbName, dbVersion);

      newRequest.onerror = (event) => {
        reject("Error opening IndexedDB");
      };
      newRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        const store = db.createObjectStore("users", { keyPath: "username" });
        store.createIndex("password", "password", { unique: false });
        const adminCredentials = { username: "admin", password: "admin" };
        store.add(adminCredentials);
      };

      newRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
    };
  });
};

export const getUser = async (username) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const getRequest = store.get(username);

    getRequest.onsuccess = (event) => {
      const user = event.target.result;
      if (user) {
        resolve(user); // Return the user object
      } else {
        resolve(null); // User not found
      }
    };

    getRequest.onerror = (event) => {
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};
// export const getUser = async(username) => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(dbName, dbVersion);

//     request.onsuccess = (event) => {
//       const db = event.target.result;
//       const transaction = db.transaction("users", "readonly");
//       const store = transaction.objectStore("users");
//       const getRequest = store.get(username);

//       getRequest.onsuccess = (event) => {
//         const user = event.target.result;
//         if (user) {
//           resolve(user.username); // Return the username
//         } else {
//           resolve(null); // User not found
//         }
//       };

//       getRequest.onerror = (event) => {
//         reject(event.target.error);
//       };

//       transaction.oncomplete = () => {
//         db.close();
//       };
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// };








// export const getUser = async (username) => {
//   const db = await openDB();
//   const transaction = db.transaction("users", "readonly");
//   const store = transaction.objectStore("users");
//   const user = await store.get(username);
//   alert(user);
//   // console.log(user, "===>", user.username);
//   return user;
// };

export const updateUserPassword = async (username, newPassword) => {
  const db = await openDB();
  const transaction = db.transaction("users", "readwrite");
  const store = transaction.objectStore("users");
  const user = await store.get(username);
  if (user) {
    user.password = newPassword;
    store.put(user);
  }
};
export const generateNewPassword = () => {
  // Generate a new random password (you can implement your own logic)
  const newPassword = Math.random().toString(36).slice(2); // Generate a random alphanumeric password
  return newPassword;
};

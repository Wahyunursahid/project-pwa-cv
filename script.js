var db;
        var request = indexedDB.open("KomentarDB", 1);

        request.onerror = function(event) {
            console.log("Gagal membuka database:", event.target.errorCode);
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log("Berhasil membuka database");
            showAllComments();
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;

            // Membuat object store dengan nama "comments"
            var objectStore = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("email", "email", { unique: false });
            objectStore.createIndex("comment", "comment", { unique: false });
        };

        document.getElementById("comment-form").addEventListener("submit", function(event) {
            event.preventDefault();

            var nameInput = document.getElementById("name-input").value;
            var emailInput = document.getElementById("email-input").value;
            var commentInput = document.getElementById("comment-input").value;

            if (nameInput && emailInput && commentInput) {
                var transaction = db.transaction(["comments"], "readwrite");
                var objectStore = transaction.objectStore("comments");
                var request = objectStore.add({ name: nameInput, email: emailInput, comment: commentInput });

                request.onsuccess = function(event) {
                    console.log("Komentar berhasil disimpan");
                    document.getElementById("name-input").value = "";
                    document.getElementById("email-input").value = "";
                    document.getElementById("comment-input").value = "";
                    showAllComments();
                    // Menampilkan notifikasi
                    showNotification("Anda mendapat pesan baru!");
                };
            }else {
                alert("Harap isi semua field (nama, email, dan komentar) sebelum mengirim komentar.");
            }
        });

        function showNotification(message) {
            if ('Notification' in window) {
                Notification.requestPermission().then(function (permission) {
                    if (permission === 'granted') {
                        const notification = new Notification('Pemberitahuan Komentar', {
                            body: message,
                        });
                    }
                });
            }
        }

        document.addEventListener("DOMContentLoaded", function() {
            // Setelah 10 detik, tampilkan notifikasi selamat datang
            setTimeout(function() {
                showWelcomeNotification("Selamat datang di web CV ! ingin berlangganan ?hubungi kami via whatsapp");
            }, 5000); // 10000 milidetik (10 detik)
        });
        
        function showWelcomeNotification(message) {
            if ('Notification' in window) {
                Notification.requestPermission().then(function (permission) {
                    if (permission === 'granted') {
                        const notification = new Notification('Selamat Datang', {
                            body: message,
                        });
                    }
                });
            }
        }

        function showAllComments() {
            var transaction = db.transaction(["comments"], "readonly");
            var objectStore = transaction.objectStore("comments");
            var allCommentsList = document.getElementById("all-comments-list");
            allCommentsList.innerHTML = "";

            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var li = document.createElement("li");
                    li.textContent = cursor.value.name + " (" + cursor.value.email + "): " + cursor.value.comment;
                    li.dataset.commentId = cursor.value.id;
                    li.innerHTML += ' <button onclick="editComment(' + cursor.value.id + ')">Edit</button> <button onclick="deleteComment(' + cursor.value.id + ')">Hapus</button>';
                    allCommentsList.appendChild(li);
                    cursor.continue();
                }
            };
        }

        function editComment(commentId) {
            var newComment = prompt("Edit komentar:");
            if (newComment !== null) {
                var transaction = db.transaction(["comments"], "readwrite");
                var objectStore = transaction.objectStore("comments");
                var request = objectStore.get(commentId);
                request.onsuccess = function(event) {
                    var data = event.target.result;
                    data.comment = newComment;
                    objectStore.put(data);
                    showAllComments();
                };
            }
        }

        function deleteComment(commentId) {
            var confirmDelete = confirm("Apakah Anda yakin ingin menghapus komentar ini?");
            if (confirmDelete) {
                var transaction = db.transaction(["comments"], "readwrite");
                var objectStore = transaction.objectStore("comments");
                objectStore.delete(commentId);
                showAllComments();
            }
        }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('Service Worker berhasil didaftarkan:', registration);
            })
            .catch(function(error) {
                console.log('Gagal mendaftarkan Service Worker:', error);
            });
    }
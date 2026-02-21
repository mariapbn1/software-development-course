/* =========================
   1. CONFIGURATION & UTILITIES
========================= */
const API_BASE = "http://127.0.0.1:8000/api";

// Prevent XSS / HTML injection
const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));

// Toast notifications
const showToast = (msg) => {
  const toastEl = document.getElementById('appToast');
  if (toastEl) {
    document.getElementById('toastBody').textContent = msg;
    new bootstrap.Toast(toastEl).show();
  } else {
    alert(msg);
  }
};

/* =========================
   2. LOGIN (index.html)
========================= */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('auth', JSON.stringify(data));
        window.location.href = 'productos.html'; // Admin CRUD
      } else {
        document.getElementById('loginAlert').classList.remove('d-none');
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast("Error: No hay conexión con el servidor.");
    }
  });
}

/* =========================
   3. ADMIN PRODUCTS & CRUD (productos.html)
========================= */
const tbody = document.getElementById('productsTbody');
if (tbody) {

  // Only admins can access
  const auth = sessionStorage.getItem('auth');
  if (!auth) window.location.href = 'index.html';

  let allProducts = [];
  let editingProductId = null; // ✅ NEW (track edit mode)

  /* RESET MODAL WHEN CREATING PRODUCT */
const addProductBtn =
  document.querySelector('[data-bs-target="#productModal"]');

if (addProductBtn) {
  addProductBtn.addEventListener('click', () => {

    // exit edit mode
    editingProductId = null;

    // reset form fields
    document.getElementById('productForm')?.reset();

    // restore modal title
    document.querySelector(
      '#productModal .modal-title'
    ).textContent = "Nuevo Dispositivo";
  });
}

  const renderTable = (data) => {
    tbody.innerHTML = data.map(p => `
<tr>
<td>${p.id}</td>
<td>
<a href="detalle.html?id=${p.id}" 
class="text-dark fw-bold text-decoration-none">
${escapeHtml(p.name)}
</a>
</td>
<td><span class="badge bg-secondary">${p.ram} GB</span></td>
<td><span class="badge bg-info text-dark">${p.storage} GB</span></td>
<td class="small text-muted">${p.release_date}</td>

<td class="text-center">
<button class="btn btn-sm btn-outline-primary me-1"
  onclick="prepareEdit(${p.id})">
Editar
</button>

<button class="btn btn-sm btn-outline-danger"
  onclick="prepareDelete(${p.id}, '${escapeHtml(p.name)}')">
Eliminar
</button>
</td>
</tr>
    `).join('');

    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) totalCountEl.textContent = data.length;
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`);
      if (!res.ok) throw new Error("Error connecting to API");

    allProducts = await res.json();

    // sort by ID ascending
    allProducts.sort((a, b) => a.id - b.id);

renderTable(allProducts);

    } catch (err) {
      console.error("Load error:", err);
      showToast("Error: No se pudieron cargar los productos.");
    }
  };

  /* ✅ EDIT BUTTON LOGIC */
  window.prepareEdit = (id) => {

    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;

    document.querySelector('#productModal .modal-title')
    .textContent = "Editar Dispositivo";
    document.getElementById('productName').value = product.name;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productRam').value = product.ram;
    document.getElementById('productStorage').value = product.storage;
    document.getElementById('productBattery').value = product.max_battery;
    document.getElementById('productMainCam').value = product.main_camera_res;
    document.getElementById('productSelfieCam').value = product.selfie_camera_res;
    document.getElementById('productNfc').checked = product.has_nfc;
    document.getElementById('productJack').checked = product.has_headphone_jack;
    document.getElementById('productImage').value = product.product_image;
    document.getElementById('productDescription').value = product.synopsis;
    document.getElementById('productColor').value = product.color;
    document.getElementById('productNetwork').value = product.max_supported_network;
    document.getElementById('productOS').value = product.operating_system;

    new bootstrap.Modal(
      document.getElementById('productModal')
    ).show();
  };

  // Search / filter
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(term)
      );
      renderTable(filtered);
    };
  }

  /* ✅ CREATE OR UPDATE PRODUCT */
  const productForm = document.getElementById('productForm');
  if (productForm) {

    productForm.onsubmit = async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById('productName').value,
        brand: parseInt(document.getElementById('productBrand').value),
        ram: parseInt(document.getElementById('productRam').value),
        storage: parseInt(document.getElementById('productStorage').value),
        max_battery: parseInt(document.getElementById('productBattery').value),
        main_camera_res: parseInt(document.getElementById('productMainCam').value),
        selfie_camera_res: parseInt(document.getElementById('productSelfieCam').value),
        has_nfc: document.getElementById('productNfc').checked,
        has_headphone_jack: document.getElementById('productJack').checked,
        product_image: document.getElementById('productImage').value,
        release_date: new Date().toISOString().split('T')[0],
        synopsis: document.getElementById('productDescription').value,
        color: parseInt(document.getElementById('productColor').value),
        max_supported_network: parseInt(document.getElementById('productNetwork').value),
        operating_system: parseInt(document.getElementById('productOS').value)
      };

      try {

        const url = editingProductId
          ? `${API_BASE}/products/${editingProductId}/`
          : `${API_BASE}/products/`;

        const method = editingProductId ? 'PATCH' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {

          bootstrap.Modal
            .getInstance(document.getElementById('productModal'))
            ?.hide();

          productForm.reset();
          editingProductId = null;

          showToast(
            method === 'PUT'
              ? "Producto actualizado"
              : "Producto guardado"
          );

          loadProducts();
        }

      } catch (err) {
        console.error(err);
        showToast("Error al conectar con la API.");
      }
    };
  }

  // Delete product
  window.prepareDelete = (id, name) => {
    document.getElementById('deleteId').value = id;
    document.getElementById('deleteNamePreview').textContent = name;
    new bootstrap.Modal(
      document.getElementById('confirmDeleteModal')
    ).show();
  };

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async () => {

      const id = document.getElementById('deleteId').value;

      const res = await fetch(
        `${API_BASE}/products/${id}/`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        bootstrap.Modal
          .getInstance(document.getElementById('confirmDeleteModal'))
          ?.hide();

        showToast("Producto eliminado");
        loadProducts();
      }
    };
  }

  loadProducts();
}

/* =========================
   4. PRODUCT DETAILS & COMMENTS (detalle.html)
========================= */
const commentsList = document.getElementById('commentsList');
if (commentsList) {
  const productId = new URLSearchParams(window.location.search).get('id');

  // Load product info
  const loadDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`);
      const products = await res.json();
      const p = products.find(x => x.id == productId);
      if (!p) return;
      document.getElementById('pName').textContent = p.name;
      document.getElementById('pRam').textContent = `${p.ram} GB RAM`;
      document.getElementById('pStorage').textContent = `${p.storage} GB`;
      document.getElementById('pBattery').textContent = `${p.max_battery} mAh`;
      document.getElementById('pSynopsis').textContent = p.synopsis;
      document.getElementById('pCam').textContent = `${p.main_camera_res} MP`;
      document.getElementById('pNfc').textContent = p.has_nfc ? "SÍ" : "NO";
      document.getElementById('pDate').textContent = p.release_date;
      // Optional: admin edit/delete buttons can be shown here if session exists
    } catch (err) {
      console.error("Error loading product detail:", err);
      showToast("No se pudo cargar el producto");
    }
  };

  // Load comments
  const loadComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/comments/`);
      const allComments = await res.json();
      const filtered = allComments.filter(c => c.product == productId);
      commentsList.innerHTML = filtered.map(c => `
<div class="card mb-2 p-2 shadow-sm border-0 small bg-light">
<strong>${escapeHtml(c.user)}</strong>
<p class="mb-0 text-muted">${escapeHtml(c.comment)}</p>
</div>`).reverse().join('') ||
      '<p class="text-center small text-muted py-4">No hay comentarios. Sé el primero!</p>';
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  // Submit comment
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        user: document.getElementById('cUser').value.trim(),
        email: "usuario_anonimo@inventario.com",
        comment: document.getElementById('cText').value.trim(),
        product: parseInt(productId),
        date: new Date().toISOString().split('T')[0]
      };
      try {
        const res = await fetch(`${API_BASE}/comments/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          e.target.reset();
          showToast("Comentario enviado");
          loadComments();
        }
      } catch (err) {
        console.error("Error posting comment:", err);
        showToast("No se pudo enviar el comentario");
      }
    };
  }

  loadDetail();
  loadComments();
}

/* =========================
   5. LOGOUT BUTTON
========================= */
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.onclick = () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  };
}
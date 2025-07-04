document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const mensaje = document.getElementById('mensaje');
    const tablaBody = document.querySelector('#tablaProductos tbody');

    // Inicializar modal Bootstrap para editar
    const modalEditarEl = document.getElementById('modalEditar');
    const modalEditar = new bootstrap.Modal(modalEditarEl);

    const formEditar = document.getElementById('formEditar');

    // Mostrar mensaje con Bootstrap alert
    function mostrarMensaje(texto, tipo = 'success') {
        mensaje.className = `alert alert-${tipo}`;
        mensaje.textContent = texto;
        mensaje.classList.remove('d-none');
        setTimeout(() => {
            mensaje.classList.add('d-none');
        }, 3000);
    }

    // Cargar y mostrar productos en tabla
    function cargarProductos() {
        fetch('/products')
            .then(res => res.json())
            .then(data => {
                tablaBody.innerHTML = '';
                data.forEach(p => {
                    tablaBody.innerHTML += `
                        <tr>
                            <td>${p.nombreProducto}</td>
                            <td>${p.estado}</td>
                            <td>${p.clasificacion}</td>
                            <td>$${p.precio.toFixed(2)}</td>
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="abrirModal(${p.id_Producto}, '${escapeHtml(p.nombreProducto)}', '${p.estado}', '${p.clasificacion}', ${p.precio})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${p.id_Producto})">Eliminar</button>
                            </td>
                        </tr>`;
                });
            })
            .catch(() => mostrarMensaje('Error al cargar productos', 'danger'));
    }

    // Escapar caracteres para evitar problemas en onclick inline (especialmente comillas)
    function escapeHtml(text) {
        return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // Crear nuevo producto
    form.addEventListener('submit', e => {
        e.preventDefault();

        const nombre = document.getElementById('nombreProducto').value.trim();
        const estado = document.getElementById('estado').value;
        const clasificacion = document.getElementById('clasificacion').value;
        const precio = parseFloat(document.getElementById('precio').value);

        if (!nombre || isNaN(precio)) {
            mostrarMensaje('Por favor completa todos los campos correctamente', 'warning');
            return;
        }

        fetch('/products', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nombreProducto: nombre, estado, clasificacion, precio })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                mostrarMensaje(data.error, 'danger');
            } else {
                mostrarMensaje(data.mensaje, 'success');
                form.reset();
                cargarProductos();
            }
        })
        .catch(() => mostrarMensaje('Error al guardar producto', 'danger'));
    });

    // Abrir modal y cargar datos para editar
    window.abrirModal = (id, nombre, estado, clasificacion, precio) => {
        document.getElementById('editId').value = id;
        document.getElementById('editNombre').value = nombre;
        document.getElementById('editEstado').value = estado;
        document.getElementById('editClasificacion').value = clasificacion;
        document.getElementById('editPrecio').value = precio;
        modalEditar.show();
    };

    // Enviar edición del producto
    formEditar.addEventListener('submit', e => {
        e.preventDefault();

        const id = document.getElementById('editId').value;
        const nombre = document.getElementById('editNombre').value.trim();
        const estado = document.getElementById('editEstado').value;
        const clasificacion = document.getElementById('editClasificacion').value;
        const precio = parseFloat(document.getElementById('editPrecio').value);

        if (!nombre || isNaN(precio)) {
            mostrarMensaje('Por favor completa todos los campos correctamente', 'warning');
            return;
        }

        fetch(`/products/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nombreProducto: nombre, estado, clasificacion, precio })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                mostrarMensaje(data.error, 'danger');
            } else {
                mostrarMensaje(data.mensaje, 'success');
                modalEditar.hide();
                cargarProductos();
            }
        })
        .catch(() => mostrarMensaje('Error al actualizar producto', 'danger'));
    });

    // Eliminar producto con confirmación
    window.eliminarProducto = (id) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            fetch(`/products/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    mostrarMensaje(data.mensaje, 'success');
                    cargarProductos();
                })
                .catch(() => mostrarMensaje('Error al eliminar producto', 'danger'));
        }
    };

    // Carga inicial
    cargarProductos();
});

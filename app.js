const API_URL = 'http://localhost:8080/api/carrito';

const diccionarioProductos = {
    1: 'Móvil Nova Pro',
    2: 'PC Escritorio Master',
    3: 'Tablet Flex X10'
};

async function iniciarCarrito() {
    let idCarrito = localStorage.getItem('idCarrito');
    if (!idCarrito) {
        try {
            const respuesta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUsuario: 1, correoUsuario: 'rodri@test.com' })
            });
            const datos = await respuesta.json();
            idCarrito = datos.idCarrito;
            localStorage.setItem('idCarrito', idCarrito);
            console.log("Nuevo carrito creado con ID:", idCarrito);
        } catch (error) {
            console.error("Error al crear carrito:", error);
        }
    }
    return idCarrito;
}

async function anadirAlCarrito(idArticulo, precioUnitario) {
    const idCarrito = await iniciarCarrito();
    if (!idCarrito) return;

    const linea = {
        idArticulo: idArticulo,
        precioUnitario: precioUnitario,
        numeroUnidades: 1
    };

    try {
        const res = await fetch(`${API_URL}/${idCarrito}/lineas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(linea)
        });
        if (res.ok) {
            alert('Producto añadido al carrito.');
        }
    } catch (error) {
        console.error("Error al añadir línea:", error);
    }
}

// NUEVA FUNCIÓN: Borrar un producto del carrito
async function borrarDelCarrito(idLinea) {
    const idCarrito = localStorage.getItem('idCarrito');
    if (!idCarrito) return;

    try {
        // Llamada DELETE al backend
        const res = await fetch(`${API_URL}/${idCarrito}/lineas/${idLinea}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            // Si el backend lo borra bien, recargamos la tabla para que desaparezca visualmente
            cargarCarrito();
        } else {
            console.error("El backend no ha podido borrar la línea.");
        }
    } catch (error) {
        console.error("Error en la petición de borrado:", error);
    }
}

async function cargarCarrito() {
    const idCarrito = localStorage.getItem('idCarrito');
    if (!idCarrito) return;

    try {
        const respuesta = await fetch(`${API_URL}/${idCarrito}`);
        const carrito = await respuesta.json();

        const tbody = document.getElementById('tabla-carrito');
        const thTotal = document.getElementById('total-carrito');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (!carrito.lineas || carrito.lineas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">El carrito está vacío</td></tr>';
            thTotal.innerText = '0.00 €';
            return;
        }

        carrito.lineas.forEach(linea => {
            const nombre = diccionarioProductos[linea.idArticulo] || "Producto Desconocido";
            // Aquí inyectamos el HTML de cada producto, incluyendo el nuevo botón de borrar
            tbody.innerHTML += `
                <tr>
                    <td>${nombre}</td>
                    <td>${linea.precioUnitario} €</td>
                    <td>${linea.numeroUnidades}</td>
                    <td>${linea.costeLinea} €</td>
                    <td>
                        <button class="btn" style="background-color: #e74c3c; padding: 5px 10px;" onclick="borrarDelCarrito(${linea.idLinea})">
                            Borrar
                        </button>
                    </td>
                </tr>
            `;
        });
        thTotal.innerText = carrito.totalPrecio + ' €';
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
    }
}
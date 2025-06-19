document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Inicializando script...');

    const productosTableBody = document.querySelector('#productosTable tbody');
    const addProductoBtn = document.getElementById('addProductoBtn');
    
    // Elementos de los campos de cliente
    const clienteNombreInput = document.getElementById('clienteNombre');
    const clienteEmpresaInput = document.getElementById('clienteEmpresa');
    const clienteTelefonoInput = document.getElementById('clienteTelefono');
    const clienteEmailInput = document.getElementById('clienteEmail');
    const cotizacionFechaInput = document.getElementById('cotizacionFecha');

    // Botones y inputs de gestión de clientes
    const guardarClienteBtn = document.getElementById('guardarClienteBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const descargarCsvClientesBtn = document.getElementById('descargarCsvClientesBtn');
    
    // *******************************************************************
    // VERIFICACIÓN DE EXISTENCIA DE ELEMENTOS (IMPORTANTE PARA DEPURAR)
    // *******************************************************************
    if (!productosTableBody) console.error('Error: #productosTable tbody no encontrado.');
    if (!addProductoBtn) console.error('Error: #addProductoBtn no encontrado.');
    if (!clienteNombreInput) console.error('Error: #clienteNombre no encontrado.');
    if (!guardarClienteBtn) console.error('Error: #guardarClienteBtn no encontrado.');
    if (!csvFileInput) console.error('Error: #csvFileInput no encontrado.');
    if (!descargarCsvClientesBtn) console.error('Error: #descargarCsvClientesBtn no encontrado.');
    if (!clienteEmpresaInput) console.error('Error: #clienteEmpresa no encontrado.');
    if (!clienteTelefonoInput) console.error('Error: #clienteTelefono no encontrado.');
    if (!clienteEmailInput) console.error('Error: #clienteEmail no encontrado.');
    if (!cotizacionFechaInput) console.error('Error: #cotizacionFecha no encontrado.');


    // Funciones de utilidad para el cálculo
    function formatCurrency(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    }

    function calculateTotals() {
        let subtotal = 0;
        document.querySelectorAll('#productosTable tbody tr').forEach(row => {
            const totalCell = row.cells[3]; // La cuarta celda (índice 3) es el total
            const totalValue = parseFloat(totalCell.textContent.replace('$', '')) || 0;
            subtotal += totalValue;
        });

        const iva = subtotal * 0.16; // Asumiendo 16% de IVA
        const total = subtotal + iva;

        document.getElementById('subtotalDisplay').textContent = formatCurrency(subtotal);
        document.getElementById('ivaDisplay').textContent = formatCurrency(iva);
        document.getElementById('totalDisplay').textContent = formatCurrency(total);
    }

    // Función para añadir un nuevo producto
    addProductoBtn.addEventListener('click', () => {
        const newRow = productosTableBody.insertRow();
        
        const descripcionCell = newRow.insertCell();
        const cantidadCell = newRow.insertCell();
        const precioUnitarioCell = newRow.insertCell();
        const totalCell = newRow.insertCell();
        const accionesCell = newRow.insertCell();

        descripcionCell.innerHTML = `<input type="text" placeholder="Descripción del producto" class="product-description" />`;
        cantidadCell.innerHTML = `<input type="number" value="1" min="1" class="product-quantity" />`;
        precioUnitarioCell.innerHTML = `<input type="number" value="0.00" min="0" step="0.01" class="product-price" />`;
        totalCell.textContent = formatCurrency(0); // Inicializar total en 0
        accionesCell.innerHTML = `<button class="delete-product-btn">X</button>`;

        // Event listeners para los nuevos inputs
        const quantityInput = cantidadCell.querySelector('.product-quantity');
        const priceInput = precioUnitarioCell.querySelector('.product-price');
        const deleteBtn = accionesCell.querySelector('.delete-product-btn');

        const updateRowTotal = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            totalCell.textContent = formatCurrency(quantity * price);
            calculateTotals();
        };

        quantityInput.addEventListener('input', updateRowTotal);
        priceInput.addEventListener('input', updateRowTotal);
        deleteBtn.addEventListener('click', () => {
            newRow.remove();
            calculateTotals();
        });

        calculateTotals(); // Recalcular totales después de añadir un producto
    });

    // Asegurarse de que al menos un producto esté presente al inicio
    if (productosTableBody.rows.length === 0) {
        addProductoBtn.click(); // Simula un clic para añadir el primer producto
    }

    // ************************************************
    // Funciones para la gestión de clientes (CSV)
    // ************************************************

    let clients = []; // Array para almacenar los clientes cargados o guardados

    // Cargar clientes desde LocalStorage al iniciar
    function loadClients() {
        const storedClients = localStorage.getItem('mtkClients');
        if (storedClients) {
            clients = JSON.parse(storedClients);
            console.log('Clientes cargados desde LocalStorage:', clients);
        }
    }

    // Guardar clientes en LocalStorage
    function saveClients() {
        localStorage.setItem('mtkClients', JSON.stringify(clients));
        console.log('Clientes guardados en LocalStorage.');
    }

    // Actualiza el texto y la clase del botón de guardar/actualizar cliente
    function updateSaveButtonState(isExistingClient) {
        if (guardarClienteBtn) {
            if (isExistingClient) {
                guardarClienteBtn.textContent = 'Actualizar Cliente Existente';
                guardarClienteBtn.classList.add('btn-existing-client');
                guardarClienteBtn.classList.remove('btn-new-client');
            } else {
                guardarClienteBtn.textContent = 'Guardar Nuevo Cliente';
                guardarClienteBtn.classList.add('btn-new-client');
                guardarClienteBtn.classList.remove('btn-existing-client');
            }
        }
    }

    // Busca un cliente por nombre o email
    function findClient(name, email) {
        return clients.find(client => 
            (client.nombre && client.nombre.toLowerCase() === name.toLowerCase()) ||
            (client.email && client.email.toLowerCase() === email.toLowerCase())
        );
    }

    // Rellena los campos del formulario con los datos del cliente encontrado
    function fillClientFields(client) {
        if (client) {
            if (clienteNombreInput) clienteNombreInput.value = client.nombre || '';
            if (clienteEmpresaInput) clienteEmpresaInput.value = client.empresa || '';
            if (clienteTelefonoInput) clienteTelefonoInput.value = client.telefono || '';
            if (clienteEmailInput) clienteEmailInput.value = client.email || '';
        }
    }

    // Limpia los campos de empresa, teléfono y email si nombre o email principal están vacíos
    function clearOtherClientFields() {
        const nombre = clienteNombreInput ? clienteNombreInput.value.trim() : '';
        const email = clienteEmailInput ? clienteEmailInput.value.trim() : '';

        if (!nombre && !email) {
            if (clienteEmpresaInput) clienteEmpresaInput.value = '';
            if (clienteTelefonoInput) clienteTelefonoInput.value = '';
            // No limpiar clienteEmailInput ni clienteNombreInput aquí para evitar bucles.
            // Estos son los que disparan esta función.
        }
    }

    // Verifica si el cliente existe y actualiza el botón y campos
    function checkClientExistenceAndUpdateButton() {
        const nombre = clienteNombreInput ? clienteNombreInput.value.trim() : '';
        const email = clienteEmailInput ? clienteEmailInput.value.trim() : '';

        if (nombre || email) {
            const existingClient = findClient(nombre, email);
            if (existingClient) {
                updateSaveButtonState(true); // Cliente existente
                fillClientFields(existingClient); // Rellenar campos
            } else {
                updateSaveButtonState(false); // Nuevo cliente
                // No limpiar campos aquí para permitir al usuario introducir nuevos datos
            }
        } else {
            updateSaveButtonState(false); // Campos vacíos, se considera nuevo cliente
            // No limpiar campos aquí para permitir al usuario introducir nuevos datos
        }
    }

    // Guarda o actualiza un cliente
    function saveClientDetails() {
        const nombre = clienteNombreInput.value.trim();
        const empresa = clienteEmpresaInput.value.trim();
        const telefono = clienteTelefonoInput.value.trim();
        const email = clienteEmailInput.value.trim();

        if (!nombre && !email) {
            alert('Por favor, ingresa el nombre o el email del cliente.');
            return;
        }

        const existingClientIndex = clients.findIndex(client => 
            (client.nombre && client.nombre.toLowerCase() === nombre.toLowerCase()) ||
            (client.email && client.email.toLowerCase() === email.toLowerCase())
        );

        if (existingClientIndex !== -1) {
            // Actualizar cliente existente
            clients[existingClientIndex] = { nombre, empresa, telefono, email };
            alert('Cliente actualizado exitosamente!');
        } else {
            // Guardar nuevo cliente
            clients.push({ nombre, empresa, telefono, email });
            alert('Nuevo cliente guardado exitosamente!');
        }
        saveClients(); // Guarda los cambios en LocalStorage
        checkClientExistenceAndUpdateButton(); // Actualiza el estado del botón
    }

    // Cargar CSV de clientes
    function handleCsvUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                try {
                    const parsedClients = parseCsv(text);
                    clients = [...clients, ...parsedClients.filter(pc => !findClient(pc.nombre, pc.email))]; // Añadir solo clientes nuevos
                    saveClients();
                    alert('Clientes cargados desde CSV exitosamente!');
                } catch (error) {
                    alert('Error al procesar el archivo CSV. Asegúrate de que tenga el formato correcto (nombre,empresa,telefono,email).');
                    console.error('Error parsing CSV:', error);
                }
            };
            reader.readAsText(file);
        }
    }

    // Función simple para parsear CSV (asume formato: nombre,empresa,telefono,email)
    function parseCsv(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const parsedData = [];
        // Saltamos la primera línea si asumimos que son encabezados
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 4) { // Asegurarse de que hay suficientes columnas
                parsedData.push({
                    nombre: parts[0] ? parts[0].trim() : '',
                    empresa: parts[1] ? parts[1].trim() : '',
                    telefono: parts[2] ? parts[2].trim() : '',
                    email: parts[3] ? parts[3].trim() : ''
                });
            }
        }
        return parsedData;
    }

    // Descargar CSV de clientes
    function downloadClientsCsv() {
        if (clients.length === 0) {
            alert('No hay clientes para descargar.');
            return;
        }

        let csvContent = "nombre,empresa,telefono,email\n"; // Encabezados
        clients.forEach(client => {
            csvContent += `${client.nombre || ''},${client.empresa || ''},${client.telefono || ''},${client.email || ''}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "clientes_mtk.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }


    // ************************************************
    // Funcionalidad para generar el PDF (usando jsPDF)
    // ************************************************

    window.descargarPDF = async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Datos de la empresa (MTK)
        const empresaNombre = "MTK Macro Tecnologias Kernel";
        const empresaDireccion = "Av los pinos 731 -A los Angeles 2 sec, Sanicolas de los Garza, Nuevo Leon";
        const empresaEmail = "ventas@macrotek.com.mx";
        const empresaTelefono = "+52 81 3847 4143";

        // Logo de la empresa
        const img = new Image();
        img.src = 'logo_mtk.png'; // Asegúrate de que la ruta sea correcta

        let logoBase64 = null; // Para almacenar el logo como Base64
        const maxLogoLoadTime = 5000; // 5 segundos para cargar el logo

        // Intentar cargar el logo y convertirlo a Base64 para una mejor fiabilidad en jsPDF
        try {
            logoBase64 = await new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    reject(new Error('Tiempo de carga del logo excedido.'));
                }, maxLogoLoadTime);

                img.onload = () => {
                    clearTimeout(timer);
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => {
                    clearTimeout(timer);
                    console.error("No se pudo cargar el logo 'logo_mtk.png'. Se generará el PDF sin él.");
                    resolve(null); // Resuelve con null si hay error
                };
                img.src = 'logo_mtk.png';
            });
        } catch (error) {
            console.error(error.message);
            logoBase64 = null;
        }


        // Configuración de fuentes y colores para un aspecto profesional
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50); // Gris oscuro para la mayoría del texto

        let y = 20; // Posición inicial Y

        // Encabezado de la cotización (Logo y datos de la empresa)
        if (logoBase64) {
            const imgWidth = 40; // Ancho del logo
            // jsPDF puede manejar la altura automáticamente si no se le pasa
            doc.addImage(logoBase64, 'PNG', 15, y, imgWidth, imgWidth * (img.naturalHeight / img.naturalWidth)); // Usar proporciones originales
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(empresaNombre, 70, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(empresaDireccion, 70, y + 12);
        doc.text(`Email: ${empresaEmail}`, 70, y + 17);
        doc.text(`Teléfonos: ${empresaTelefono}`, 70, y + 22);

        y += 40; // Espacio después del encabezado


        // Título de la Cotización
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 80, 150); // Un azul profesional para el título
        doc.text("COTIZACIÓN DE SERVICIOS", 105, y, null, null, 'center');
        y += 15;

        // Número de Cotización y Fecha
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const cotizacionFecha = cotizacionFechaInput.value ? new Date(cotizacionFechaInput.value).toLocaleDateString('es-MX') : new Date().toLocaleDateString('es-MX');
        doc.text(`Fecha: ${cotizacionFecha}`, 170, y);
        // Generar un número de cotización simple (ej. basado en fecha/hora)
        const quoteNumber = `COT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}`;
        doc.text(`Número de Cotización: ${quoteNumber}`, 15, y);
        y += 15;

        // Información del Cliente
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("INFORMACIÓN DEL CLIENTE:", 15, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Nombre: ${clienteNombreInput.value || 'N/A'}`, 15, y);
        y += 5;
        if (clienteEmpresaInput.value) {
            doc.text(`Empresa: ${clienteEmpresaInput.value}`, 15, y);
            y += 5;
        }
        if (clienteTelefonoInput.value) {
            doc.text(`Teléfono: ${clienteTelefonoInput.value}`, 15, y);
            y += 5;
        }
        if (clienteEmailInput.value) {
            doc.text(`Email: ${clienteEmailInput.value}`, 15, y);
            y += 5;
        }
        y += 10; // Espacio después de la información del cliente

        // Tabla de Productos
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 80, 150);
        doc.text("DETALLE DE LA COTIZACIÓN:", 15, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);

        const tableColumnStyles = {
            0: { cellWidth: 80 }, // Descripción
            1: { cellWidth: 20, halign: 'center' }, // Cantidad
            2: { cellWidth: 30, halign: 'right' }, // Precio Unitario
            3: { cellWidth: 30, halign: 'right' }  // Total
        };

        const tableHeaders = [['Descripción', 'Cantidad', 'Precio Unitario', 'Total']];
        const tableRows = [];

        document.querySelectorAll('#productosTable tbody tr').forEach(row => {
            const description = row.querySelector('.product-description') ? row.querySelector('.product-description').value : '';
            const quantity = row.querySelector('.product-quantity') ? row.querySelector('.product-quantity').value : '';
            const price = row.querySelector('.product-price') ? formatCurrency(row.querySelector('.product-price').value) : '';
            const total = row.cells[3].textContent; // Ya está formateado por calculateTotals()
            tableRows.push([description, quantity, price, total]);
        });

        doc.autoTable({
            startY: y,
            head: tableHeaders,
            body: tableRows,
            theme: 'grid', // Puedes probar 'striped', 'grid', 'plain'
            headStyles: { 
                fillColor: [30, 80, 150], // Azul oscuro para encabezados
                textColor: [255, 255, 255], // Texto blanco
                fontStyle: 'bold'
            },
            styles: {
                font: 'helvetica',
                fontSize: 9,
                textColor: [50, 50, 50],
                lineColor: [200, 200, 200], // Líneas de tabla más claras
                lineWidth: 0.1
            },
            columnStyles: tableColumnStyles,
            margin: { left: 15, right: 15 },
            didDrawPage: function (data) {
                // Footer
                let str = "Página " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        y = doc.autoTable.previous.finalY + 10; // Actualiza la posición Y después de la tabla

        // Resumen de Totales
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);

        const subtotal = document.getElementById('subtotalDisplay').textContent;
        const iva = document.getElementById('ivaDisplay').textContent;
        const total = document.getElementById('totalDisplay').textContent;

        doc.text(`Subtotal: ${subtotal}`, 185, y, null, null, 'right');
        y += 7;
        doc.text(`IVA (16%): ${iva}`, 185, y, null, null, 'right');
        y += 7;
        doc.setFontSize(14);
        doc.setTextColor(30, 80, 150);
        doc.text(`TOTAL: ${total}`, 185, y, null, null, 'right');
        y += 20;

        // Notas o Términos (Opcional)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text("Notas:", 15, y);
        doc.text("• Precios sujetos a cambio sin previo aviso.", 15, y + 5);
        doc.text("• Validez de la cotización: 30 días.", 15, y + 10);
        doc.text("• Para cualquier consulta, contacte a ventas@macrotek.com.mx", 15, y + 15);
        y += 30;

        // Guardar el PDF
        doc.save(`Cotizacion_MTK_${clienteNombreInput.value.replace(/\s/g, '_') || 'sin_cliente'}_${cotizacionFecha.replace(/\//g, '-')}.pdf`);
    };


    // Inicialización al cargar la página
    try {
        loadClients(); // Cargar clientes al inicio

        // Event listeners para los campos de cliente:
        // - checkClientExistenceAndUpdateButton se encargará de cambiar el botón
        // - clearOtherClientFields se encargará de limpiar campos si los principales están vacíos
        if (clienteNombreInput) {
            clienteNombreInput.addEventListener('input', checkClientExistenceAndUpdateButton);
            clienteNombreInput.addEventListener('input', clearOtherClientFields); // Limpiar campos si nombre se vacía
        }
        if (clienteEmailInput) {
            clienteEmailInput.addEventListener('input', checkClientExistenceAndUpdateButton);
            clienteEmailInput.addEventListener('input', clearOtherClientFields); // Limpiar campos si email se vacía
        }
        
        // Llama a la función al cargar para establecer el estado inicial del botón
        checkClientExistenceAndUpdateButton(); 

        // Event listener para el botón de guardar/actualizar cliente
        if (guardarClienteBtn) guardarClienteBtn.addEventListener('click', saveClientDetails);

        // Event listener para cargar CSV
        if (csvFileInput) csvFileInput.addEventListener('change', handleCsvUpload);

        // Event listener para descargar CSV
        if (descargarCsvClientesBtn) descargarCsvClientesBtn.addEventListener('click', downloadClientsCsv);

    } catch (e) {
        console.error('Error durante la inicialización de event listeners o carga inicial:', e);
    }
});
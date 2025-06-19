// Variable para contar los ítems y asignar ID único
let itemCounter = 0;

// Función para generar un número de cotización aleatorio (6 dígitos)
function generateQuoteNumber() {
    return Math.floor(100000 + Math.random() * 900000); // Genera un número entre 100000 y 999999
}

// Función para añadir una nueva fila de ítem a la tabla
function addItem() {
    itemCounter++;
    const tableBody = document.querySelector('#itemsTable tbody');
    const newRow = tableBody.insertRow();
    newRow.id = `row-${itemCounter}`;

    // Celda Código
    const codeCell = newRow.insertCell();
    const codeInput = document.createElement('input');
    codeInput.type = 'text';
    codeInput.placeholder = 'Código';
    codeInput.className = 'item-code';
    codeCell.appendChild(codeInput);

    // Celda Descripción
    const descCell = newRow.insertCell();
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.placeholder = 'Descripción';
    descInput.className = 'item-desc';
    descInput.oninput = calculateTotals; // Recalcula al cambiar la descripción (aunque no afecta el total)
    descCell.appendChild(descInput);

    // Celda Unidad
    const unitCell = newRow.insertCell();
    const unitInput = document.createElement('input');
    unitInput.type = 'text';
    unitInput.placeholder = 'Unidad';
    unitInput.className = 'item-unit';
    unitCell.appendChild(unitInput);

    // Celda Cantidad
    const qtyCell = newRow.insertCell();
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '1';
    qtyInput.value = '1';
    qtyInput.className = 'item-qty';
    qtyInput.oninput = calculateTotals; // Recalcula al cambiar la cantidad
    qtyCell.appendChild(qtyInput);

    // Celda Precio Unitario
    const priceCell = newRow.insertCell();
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.value = '0.00';
    priceInput.className = 'item-price';
    priceInput.oninput = calculateTotals; // Recalcula al cambiar el precio
    priceCell.appendChild(priceInput);

    // Celda Total por ítem (solo muestra, no es input)
    const itemTotalCell = newRow.insertCell();
    itemTotalCell.className = 'item-row-total';
    itemTotalCell.textContent = '$0.00';

    // Celda Acción (eliminar)
    const actionCell = newRow.insertCell();
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'delete-item-button';
    deleteButton.onclick = function() {
        newRow.remove();
        calculateTotals(); // Recalcular después de eliminar
    };
    actionCell.appendChild(deleteButton);

    calculateTotals(); // Recalcular totales al añadir un nuevo ítem
}

// Función para calcular y mostrar los totales
function calculateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll('#itemsTable tbody tr');

    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        const itemTotal = isNaN(qty) || isNaN(price) ? 0 : qty * price;
        row.querySelector('.item-row-total').textContent = `$${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        subtotal += itemTotal;
    });

    const iva = subtotal * 0.16; // 16% de IVA
    const total = subtotal + iva;

    document.getElementById('subtotalDisplay').textContent = `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('ivaDisplay').textContent = `$${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalDisplay').textContent = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Función para cargar imágenes para jsPDF
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => {
            console.error(`Error al cargar la imagen: ${src}`, e);
            reject(`No se pudo cargar la imagen: ${src}. Asegúrate de que existe y la ruta es correcta.`);
        };
        img.src = src;
    });
}

// Función para generar el PDF
function generarPDFGeneral() {
    console.log("Intentando generar PDF...");

    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF no está cargado. Asegúrate de que los scripts CDN están en tu HTML.");
        alert("Error: Librería jsPDF no encontrada. No se puede generar el PDF.");
        return;
    }
    const doc = new jsPDF();

    // Datos del Cliente - Asegurando que siempre sean cadenas
    const clienteNombre = document.getElementById('clienteNombre').value || '';
    const clienteEmpresa = document.getElementById('clienteEmpresa').value || '';
    const clienteDireccion = document.getElementById('clienteDireccion').value || '';
    const clienteTelefono = document.getElementById('clienteTelefono').value || '';
    const clienteCorreo = document.getElementById('clienteCorreo').value || '';

    // Generar fechas y número de cotización
    const today = new Date();
    const emissionDate = today.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 7); // Validez de 7 días
    const expirationDateFormatted = expirationDate.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const quoteNumber = generateQuoteNumber();

    // Cargar los logos
    const logoPromise = loadImage('logo_mtk.png');
    const watermarkLogoPromise = loadImage('logo_mtk.png'); // Usar el mismo para la marca de agua

    Promise.all([logoPromise, watermarkLogoPromise])
        .then(([mainLogo, watermarkImage]) => {
            console.log("Ambos logos cargados. Iniciando generación de PDF...");

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            try {
                // --- HEADER DEL PDF ---

                // Columna Izquierda: Logo y Datos de la Empresa
                const companyInfoStartX = 15;
                let companyInfoCurrentY = 15;
                const imgWidth = 40;
                const imgHeight = (mainLogo.naturalHeight / mainLogo.naturalWidth) * imgWidth;
                doc.addImage(mainLogo, 'PNG', companyInfoStartX, companyInfoCurrentY, imgWidth, imgHeight);

                companyInfoCurrentY = 15 + imgHeight + 5; // Posición de texto debajo del logo
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0); // Negro
                doc.setFont('helvetica', 'normal');
                doc.text('MTK SERVICIOS S.A.S DE C.V.', companyInfoStartX, companyInfoCurrentY);
                companyInfoCurrentY += 5;
                doc.text('Av. Los Pinos 731-A Los Ángeles 2da Sec,', companyInfoStartX, companyInfoCurrentY);
                companyInfoCurrentY += 5;
                doc.text('San Nicolás de los Garza, Nuevo León', companyInfoStartX, companyInfoCurrentY);
                companyInfoCurrentY += 5;
                doc.text('info@mtkservicios.com', companyInfoStartX, companyInfoCurrentY);
                companyInfoCurrentY += 5;
                doc.text('Teléfonos: 81 3847 4143', companyInfoStartX, companyInfoCurrentY);
                const companyInfoFinalY = companyInfoCurrentY + 10; // Espacio final para bloque de empresa

                // Columna Derecha: Datos del Cliente y Detalles de la Cotización
                const rightColStartX = pageWidth / 2 + 10;
                const rightColLabelOffset = 35;
                const rightColLineSpacing = 8;
                let clientQuoteInfoCurrentY = 15;

                // Título "COTIZACIÓN" (centrado en la página)
                doc.setFontSize(28);
                doc.setFont('helvetica', 'bold');
                doc.text('COTIZACIÓN', pageWidth / 2, 25, { align: 'center' });

                // Sección de datos del cliente
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Cliente:', rightColStartX, clientQuoteInfoCurrentY);
                doc.setFont('helvetica', 'normal');
                doc.text(clienteNombre, rightColStartX + rightColLabelOffset, clientQuoteInfoCurrentY);
                clientQuoteInfoCurrentY += rightColLineSpacing;

                if (clienteEmpresa) {
                    doc.setFont('helvetica', 'bold');
                    doc.text('Empresa:', rightColStartX, clientQuoteInfoCurrentY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(clienteEmpresa, rightColStartX + rightColLabelOffset, clientQuoteInfoCurrentY);
                    clientQuoteInfoCurrentY += rightColLineSpacing;
                }

                doc.setFont('helvetica', 'bold');
                doc.text('Dirección:', rightColStartX, clientQuoteInfoCurrentY);
                doc.setFont('helvetica', 'normal');
                doc.text(clienteDireccion, rightColStartX + rightColLabelOffset, clientQuoteInfoCurrentY);
                clientQuoteInfoCurrentY += rightColLineSpacing;

                doc.setFont('helvetica', 'bold');
                doc.text('Teléfonos:', rightColStartX, clientQuoteInfoCurrentY);
                doc.setFont('helvetica', 'normal');
                doc.text(clienteTelefono, rightColStartX + rightColLabelOffset, clientQuoteInfoCurrentY);
                clientQuoteInfoCurrentY += rightColLineSpacing;

                doc.setFont('helvetica', 'bold');
                doc.text('Correo elect.:', rightColStartX, clientQuoteInfoCurrentY);
                doc.setFont('helvetica', 'normal');
                doc.text(clienteCorreo, rightColStartX + rightColLabelOffset, clientQuoteInfoCurrentY);
                clientQuoteInfoCurrentY += 10; // Espacio después de datos del cliente

                // Sección de detalles de la cotización (Fechas y Número)
                const rightAlignX = pageWidth - 15;
                const dateLabelOffset = 40;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Fecha de emisión:`, rightAlignX - dateLabelOffset, clientQuoteInfoCurrentY, { align: 'right' });
                doc.text(emissionDate, rightAlignX, clientQuoteInfoCurrentY, { align: 'right' });
                clientQuoteInfoCurrentY += 7;

                doc.text(`Cotización N°:`, rightAlignX - dateLabelOffset, clientQuoteInfoCurrentY, { align: 'right' });
                doc.text(String(quoteNumber), rightAlignX, clientQuoteInfoCurrentY, { align: 'right' });
                clientQuoteInfoCurrentY += 7;

                doc.text(`Validez:`, rightAlignX - dateLabelOffset, clientQuoteInfoCurrentY, { align: 'right' });
                doc.text(expirationDateFormatted, rightAlignX, clientQuoteInfoCurrentY, { align: 'right' });
                const clientQuoteInfoFinalY = clientQuoteInfoCurrentY + 15;

                // --- PREPARACIÓN DE DATOS DE LA TABLA ---
                const tableData = [];
                const rows = document.querySelectorAll('#itemsTable tbody tr');

                rows.forEach(row => {
                    const code = row.querySelector('.item-code').value || '';
                    const desc = row.querySelector('.item-desc').value || '';
                    const unit = row.querySelector('.item-unit').value || '';
                    const qty = parseFloat(row.querySelector('.item-qty').value);
                    const price = parseFloat(row.querySelector('.item-price').value);
                    const itemTotal = isNaN(qty) || isNaN(price) ? 0 : qty * price;
                    tableData.push([
                        code,
                        desc,
                        unit,
                        qty.toString(),
                        `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        `$${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ]);
                });

                const subtotal = parseFloat(document.getElementById('subtotalDisplay').textContent.replace('$', '').replace(/,/g, ''));
                const iva = parseFloat(document.getElementById('ivaDisplay').textContent.replace('$', '').replace(/,/g, ''));
                const total = parseFloat(document.getElementById('totalDisplay').textContent.replace('$', '').replace(/,/g, ''));

                // --- GENERACIÓN DE LA TABLA Y MARCA DE AGUA ---
                const watermarkWidth = 120;
                const watermarkHeight = (watermarkImage.naturalHeight / watermarkImage.naturalWidth) * watermarkWidth;
                const watermarkX = (pageWidth - watermarkWidth) / 2;
                const watermarkY = (pageHeight - watermarkHeight) / 2;

                doc.autoTable({
                    startY: Math.max(companyInfoFinalY, clientQuoteInfoFinalY) + 10,
                    head: [['CÓDIGO', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'PRECIO UNIT.', 'TOTAL']],
                    body: tableData,
                    theme: 'striped',
                    styles: {
                        fontSize: 9,
                        cellPadding: 2,
                        textColor: [0, 0, 0]
                    },
                    headStyles: {
                        fillColor: [65, 126, 62], // Color verde oscuro de tu tema
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 20 },
                        1: { cellWidth: 70 },
                        2: { cellWidth: 20, halign: 'center' },
                        3: { cellWidth: 25, halign: 'center' },
                        4: { cellWidth: 30, halign: 'right' },
                        5: { cellWidth: 30, halign: 'right' }
                    },
                    didDrawPage: function (data) {
                        // Marca de agua
                        doc.setGState(new doc.GState({ opacity: 0.1 }));
                        doc.addImage(watermarkImage, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
                        doc.setGState(new doc.GState({ opacity: 1 }));

                        // Número de página
                        if (data.pageNumber > 0) { // Siempre muestra el número de página
                            doc.setFontSize(8);
                            doc.text('Página ' + data.pageNumber, data.settings.margin.left, doc.internal.pageSize.height - 10);
                        }
                    }
                });

                // Totales al final de la tabla
                const finalY = doc.autoTable.previous.finalY;
                const totalLabelX = doc.autoTable.previous.columns[4].x + doc.autoTable.previous.columns[4].width;
                const totalValueX = doc.autoTable.previous.columns[5].x + doc.autoTable.previous.columns[5].width;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Subtotal:`, totalLabelX, finalY + 7, { align: 'right' });
                doc.text(`$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalValueX, finalY + 7, { align: 'right' });

                doc.text(`IVA (16%):`, totalLabelX, finalY + 13, { align: 'right' });
                doc.text(`$${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalValueX, finalY + 13, { align: 'right' });

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`TOTAL:`, totalLabelX, finalY + 22, { align: 'right' });
                doc.text(`$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalValueX, finalY + 22, { align: 'right' });
                doc.setFont('helvetica', 'normal'); // Restablecer la fuente

                doc.save(`Cotizacion_MTK_Servicios_${emissionDate.replace(/\//g, '-')}_${quoteNumber}.pdf`);

            } catch (innerError) {
                console.error("Error detallado durante la generación del PDF:", innerError);
                alert("Error: No se pudo generar el PDF. " + (innerError.message || "Un error desconocido ocurrió durante la creación del PDF. Revisa la consola para más detalles."));
            }

        }).catch(error => {
            console.error("Error al cargar una imagen:", error);
            alert("Error: No se pudo generar el PDF. " + error);
        });
}

// Añadir un ítem inicial cuando la página carga
document.addEventListener('DOMContentLoaded', addItem);
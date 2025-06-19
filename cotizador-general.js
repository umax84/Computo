let itemCounter = 0; // Para dar un ID único a cada fila

// Función para generar un número de cotización aleatorio (6 dígitos)
function generateQuoteNumber() {
    return Math.floor(100000 + Math.random() * 900000); // Genera un número entre 100000 y 999999
}

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
    descInput.oninput = calculateTotals; // Aunque no afecta el total, mantiene la consistencia
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
    qtyInput.oninput = calculateTotals;
    qtyCell.appendChild(qtyInput);

    // Celda Precio Unitario
    const priceCell = newRow.insertCell();
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.value = '0.00';
    priceInput.className = 'item-price';
    priceInput.oninput = calculateTotals;
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

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    document.getElementById('subtotalDisplay').textContent = `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('ivaDisplay').textContent = `$${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalDisplay').textContent = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generarPDFGeneral() {
    console.log("Intentando generar PDF...");

    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF no está cargado. Asegúrate de que los scripts CDN están en tu HTML.");
        alert("Error: Librería jsPDF no encontrada. No se puede generar el PDF.");
        return;
    }
    const doc = new jsPDF();

    // Datos del Cliente
    const clienteNombre = document.getElementById('clienteNombre').value;
    const clienteDireccion = document.getElementById('clienteDireccion').value;
    const clienteTelefono = document.getElementById('clienteTelefono').value;
    const clienteCorreo = document.getElementById('clienteCorreo').value;

    // Generar fechas y número de cotización
    const today = new Date();
    // Formato dd/mm/yyyy
    const emissionDate = today.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 7);
    const expirationDateFormatted = expirationDate.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const quoteNumber = generateQuoteNumber();

    const logo = new Image();
    logo.src = 'logo_mtk.png';

    logo.onload = function() {
        console.log("Logo cargado exitosamente. Continuando con la generación del PDF.");

        const imgWidth = 40; // Ajusta según el tamaño del logo en el PDF de muestra
        const imgHeight = (logo.naturalHeight / logo.naturalWidth) * imgWidth;
        doc.addImage(logo, 'PNG', 15, 15, imgWidth, imgHeight); // Posición del logo (más hacia la izquierda y arriba)

        // Información de la empresa (texto superior izquierdo)
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Negro
        doc.setFont('helvetica', 'normal');
        doc.text('MTK SERVICIOS S.A.S DE C.V.', 15, 15 + imgHeight + 5); // Debajo del logo
        doc.text('Av. Los Pinos 731-A Los Ángeles 2da Sec,', 15, 15 + imgHeight + 10);
        doc.text('San Nicolás de los Garza, Nuevo León', 15, 15 + imgHeight + 15);
        doc.text('info@mtkservicios.com', 15, 15 + imgHeight + 20); // Email
        doc.text('Teléfonos: 81 3847 4143', 15, 15 + imgHeight + 25); // Teléfono

        // Título "COTIZACIÓN"
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('COTIZACIÓN', 105, 30, { align: 'center' }); // Centrado

        // Sección de detalles de la cotización (fechas y número) - Alineado a la derecha
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const rightAlignX = 195; // Margen derecho para alineación
        let currentY = 50; // Posición inicial para esta sección

        doc.text(`Fecha de emisión:`, rightAlignX - 40, currentY, { align: 'right' });
        doc.text(emissionDate, rightAlignX, currentY, { align: 'right' });
        currentY += 7;

        doc.text(`Cotización N°:`, rightAlignX - 40, currentY, { align: 'right' });
        doc.text(String(quoteNumber), rightAlignX, currentY, { align: 'right' });
        currentY += 7;

        doc.text(`Validez:`, rightAlignX - 40, currentY, { align: 'right' });
        doc.text(expirationDateFormatted, rightAlignX, currentY, { align: 'right' });
        currentY += 15; // Espacio después de esta sección

        // Sección de datos del cliente - Alineado a la izquierda
        let clientY = currentY; // Usar la Y actual
        const leftAlignX = 15; // Margen izquierdo para alineación
        const labelOffset = 35; // Distancia para los valores desde el inicio de la etiqueta
        const lineSpacing = 8; // Espaciado vertical entre líneas

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente:', leftAlignX, clientY);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteNombre || '', leftAlignX + labelOffset, clientY);
        clientY += lineSpacing;

        // C.I.F/DNI: REMOVIDO PARA SIMPLIFICAR

        doc.setFont('helvetica', 'bold');
        doc.text('Dirección:', leftAlignX, clientY);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteDireccion || '', leftAlignX + labelOffset, clientY);
        clientY += lineSpacing;

        doc.setFont('helvetica', 'bold');
        doc.text('Teléfonos:', leftAlignX, clientY);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteTelefono || '', leftAlignX + labelOffset, clientY);
        clientY += lineSpacing;

        doc.setFont('helvetica', 'bold');
        doc.text('Correo elect.:', leftAlignX, clientY);
        doc.setFont('helvetica', 'normal');
        doc.text(clienteCorreo || '', leftAlignX + labelOffset, clientY);
        clientY += 15; // Espacio antes de la tabla


        const tableData = [];
        const rows = document.querySelectorAll('#itemsTable tbody tr');

        rows.forEach(row => {
            const code = row.querySelector('.item-code').value;
            const desc = row.querySelector('.item-desc').value;
            const unit = row.querySelector('.item-unit').value;
            const qty = parseFloat(row.querySelector('.item-qty').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            const itemTotal = isNaN(qty) || isNaN(price) ? 0 : qty * price;
            tableData.push([
                code || '',
                desc || '',
                unit || '',
                qty.toString(),
                `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `$${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ]);
        });

        const subtotal = parseFloat(document.getElementById('subtotalDisplay').textContent.replace('$', '').replace(/,/g, ''));
        const iva = parseFloat(document.getElementById('ivaDisplay').textContent.replace('$', '').replace(/,/g, ''));
        const total = parseFloat(document.getElementById('totalDisplay').textContent.replace('$', '').replace(/,/g, ''));

        doc.autoTable({
            startY: clientY,
            head: [['CÓDIGO', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'PRECIO UNIT.', 'TOTAL']],
            body: tableData,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 2,
                textColor: [0, 0, 0]
            },
            headStyles: {
                fillColor: [65, 126, 62], // Verde oscuro de MTK
                textColor: 255, // Texto blanco
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 20 }, // Código
                1: { cellWidth: 70 }, // Descripción (más ancha)
                2: { cellWidth: 20, halign: 'center' }, // Unidad
                3: { cellWidth: 25, halign: 'center' }, // Cantidad - AUMENTADO PARA EVITAR CORTE
                4: { cellWidth: 30, halign: 'right' }, // Precio Unitario
                5: { cellWidth: 30, halign: 'right' }  // Total
            },
            didDrawPage: function (data) {
                // Footer para páginas adicionales
                if (data.pageNumber > 1) {
                    doc.setFontSize(8);
                    doc.text('Cotización - Página ' + data.pageNumber, data.settings.margin.left, doc.internal.pageSize.height - 10);
                }
            }
        });

        // Totales al final de la tabla
        const finalY = doc.autoTable.previous.finalY;
        // Ajustado para alinear los labels de Subtotal, IVA, Total con la columna de Precio Unit.
        const totalLabelX = rightAlignX - 65; 

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal:`, totalLabelX, finalY + 7, { align: 'right' });
        doc.text(`$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightAlignX, finalY + 7, { align: 'right' });

        doc.text(`IVA (16%):`, totalLabelX, finalY + 13, { align: 'right' });
        doc.text(`$${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightAlignX, finalY + 13, { align: 'right' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL:`, totalLabelX, finalY + 22, { align: 'right' });
        doc.text(`$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightAlignX, finalY + 22, { align: 'right' });
        doc.setFont('helvetica', 'normal'); // Reset font style

        doc.save(`Cotizacion_MTK_Servicios_${emissionDate.replace(/\//g, '-')}_${quoteNumber}.pdf`);
    };

    logo.onerror = function() {
        console.error('ERROR: No se pudo cargar la imagen del logo para el PDF. Asegúrate de que "logo_mtk.png" existe en la misma carpeta que tu archivo HTML y JavaScript y que lo estás sirviendo a través de un servidor web local (ej. Python http.server o Live Server de VS Code).');
        alert('Error: No se pudo generar el PDF. Hubo un problema con la imagen del logo. Revisa la consola del navegador (F12) para más detalles.');
    };

    // Para manejar casos en los que la imagen ya está en caché y onload no se dispara
    if (logo.complete) {
        logo.onload();
    }
}

// Añadir un ítem inicial al cargar la página
document.addEventListener('DOMContentLoaded', addItem);
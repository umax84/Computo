let itemCounter = 0; // Para dar un ID único a cada fila

function addItem() {
    itemCounter++;
    const tableBody = document.querySelector('#itemsTable tbody');
    const newRow = tableBody.insertRow();
    newRow.id = `row-${itemCounter}`;

    // Celda Descripción
    const descCell = newRow.insertCell();
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.placeholder = 'Descripción del servicio/producto';
    descInput.className = 'item-desc';
    descInput.oninput = calculateTotals;
    descCell.appendChild(descInput);

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
    console.log("Intentando generar PDF..."); // Mensaje para depuración

    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF no está cargado. Asegúrate de que los scripts CDN están en tu HTML.");
        alert("Error: Librería jsPDF no encontrada. No se puede generar el PDF.");
        return;
    }
    const doc = new jsPDF();

    const clienteNombre = document.getElementById('clienteNombre').value;
    const clienteEmpresa = document.getElementById('clienteEmpresa').value;
    const cotizacionTitulo = document.getElementById('cotizacionTitulo').value || 'Cotización de Servicios';
    const observaciones = document.getElementById('observaciones').value;

    const logo = new Image();
    logo.src = 'logo_mtk.png'; // Asegúrate de que esta ruta sea correcta y la imagen esté en la misma carpeta

    logo.onload = function() { // Asegura que la imagen se cargue antes de añadirla al PDF
        console.log("Logo cargado exitosamente. Continuando con la generación del PDF."); // Mensaje para depuración
        const imgWidth = 40; // Ancho del logo
        const imgHeight = (logo.naturalHeight / logo.naturalWidth) * imgWidth;
        doc.addImage(logo, 'PNG', 15, 10, imgWidth, imgHeight);

        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text('COTIZACIÓN DE SERVICIOS', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text('MTK SERVICIOS', 105, 26, { align: 'center' });
        doc.text('San Nicolás de los Garza, Nuevo León, México', 105, 30, { align: 'center' });
        doc.text('Fecha: ' + new Date().toLocaleDateString('es-MX'), 105, 34, { align: 'center' });
        doc.text('Tel: 8138474143', 105, 38, { align: 'center' });


        doc.setFontSize(12);
        let yOffset = Math.max(10 + imgHeight + 10, 50);
        doc.text(`Título: ${cotizacionTitulo}`, 15, yOffset);
        yOffset += 7;
        if (clienteNombre) {
            doc.text(`Cliente: ${clienteNombre}`, 15, yOffset);
            yOffset += 7;
        }
        if (clienteEmpresa) {
            doc.text(`Empresa: ${clienteEmpresa}`, 15, yOffset);
            yOffset += 7;
        }
        yOffset += 10;

        const tableData = [];
        const rows = document.querySelectorAll('#itemsTable tbody tr');

        rows.forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const qty = parseFloat(row.querySelector('.item-qty').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            const itemTotal = isNaN(qty) || isNaN(price) ? 0 : qty * price;
            tableData.push([
                desc || 'N/A',
                qty.toString(),
                `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `$${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ]);
        });

        const subtotal = parseFloat(document.getElementById('subtotalDisplay').textContent.replace('$', '').replace(/,/g, ''));
        const iva = parseFloat(document.getElementById('ivaDisplay').textContent.replace('$', '').replace(/,/g, ''));
        const total = parseFloat(document.getElementById('totalDisplay').textContent.replace('$', '').replace(/,/g, ''));


        doc.autoTable({
            startY: yOffset,
            head: [['Descripción', 'Cantidad', 'Precio Unitario', 'Total']],
            body: tableData,
            theme: 'striped',
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [65, 126, 62],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 40, halign: 'right' },
                3: { cellWidth: 40, halign: 'right' }
            },
            didDrawPage: function (data) {
                if (data.pageNumber > 1) {
                    doc.setFontSize(8);
                    doc.text('Cotización - Página ' + data.pageNumber, data.settings.margin.left, doc.internal.pageSize.height - 10);
                }
            }
        });

        const finalY = doc.autoTable.previous.finalY;

        doc.setFontSize(12);
        doc.text(`Subtotal: $${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 10, { align: 'right' });
        doc.text(`IVA (16%): $${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 17, { align: 'right' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 28, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        if (observaciones) {
            doc.setFontSize(10);
            doc.text('Observaciones:', 15, finalY + 40);
            doc.setFontSize(9);
            const splitText = doc.splitTextToSize(observaciones, doc.internal.pageSize.width - 30);
            doc.text(splitText, 15, finalY + 45);
        }
        console.log("PDF listo para guardar."); // Mensaje para depuración
        doc.save(`Cotizacion_MTK_Servicios_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.pdf`);
    };

    logo.onerror = function() {
        console.error('ERROR: No se pudo cargar la imagen del logo. Asegúrate de que "logo_mtk.png" existe en la misma carpeta que tu archivo HTML y JavaScript.');
        alert('Error: No se pudo generar el PDF. Hubo un problema con la imagen del logo. Revisa la consola del navegador (F12) para más detalles.');
    };

    // Para manejar casos en los que la imagen ya está en caché y onload no se dispara
    if (logo.complete) {
        logo.onload();
    }
}

// Añadir un ítem inicial al cargar la página
document.addEventListener('DOMContentLoaded', addItem);
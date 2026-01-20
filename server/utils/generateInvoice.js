import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoice = (order, invoicePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        const stream = fs.createWriteStream(invoicePath);
        doc.pipe(stream);

        // Header
        doc.fillColor('#444444')
            .fontSize(20)
            .text('ZAIN FABRICS', 50, 57)
            .fontSize(10)
            .text('123 Textile Ave, Perundurai', 200, 65, { align: 'right' })
            .text('Tamil Nadu, India', 200, 80, { align: 'right' })
            .moveDown();

        // Invoice Info
        doc.fillColor('#000000')
            .fontSize(20)
            .text('TAX INVOICE', 50, 160);

        doc.fontSize(10)
            .text(`Invoice Number: INV-${order._id.toString().substring(0, 8).toUpperCase()}`, 50, 200)
            .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215)
            .text(`Order ID: ${order._id}`, 50, 230)
            .text(`Payment: ${order.paymentMethod}`, 50, 245)
            .moveDown();

        // Billing To
        doc.text(`Bill To:`, 300, 200)
            .text(order.user?.name || 'Customer', 300, 215)
            .text(order.billingAddress.address, 300, 230)
            .text(`${order.billingAddress.city}, ${order.billingAddress.postalCode}`, 300, 245)
            .moveDown();

        // Table Header
        const tableTop = 330;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop)
            .text('HSN', 200, tableTop)
            .text('Price', 280, tableTop, { width: 90, align: 'right' })
            .text('Qty', 370, tableTop, { width: 90, align: 'right' })
            .text('Total', 0, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Rows
        let i = 0;
        let position = 0;
        doc.font('Helvetica');

        order.orderItems.forEach((item) => {
            position = tableTop + 30 + (i * 30);
            doc.fontSize(10)
                .text(item.name.substring(0, 30), 50, position)
                .text('5903', 200, position) // Placeholder HSN
                .text(item.price.toFixed(2), 280, position, { width: 90, align: 'right' })
                .text(item.quantity, 370, position, { width: 90, align: 'right' })
                .text((item.price * item.quantity).toFixed(2), 0, position, { align: 'right' });

            i++;
        });

        // Totals
        const subtotalPosition = position + 30;
        doc.moveTo(50, subtotalPosition).lineTo(550, subtotalPosition).stroke();

        doc.font('Helvetica-Bold');
        doc.text('Subtotal', 370, subtotalPosition + 15, { width: 90, align: 'right' })
            .text(order.itemsPrice.toFixed(2), 0, subtotalPosition + 15, { align: 'right' });

        doc.text('CGST (9%)', 370, subtotalPosition + 30, { width: 90, align: 'right' })
            .text((order.taxPrice / 2).toFixed(2), 0, subtotalPosition + 30, { align: 'right' });

        doc.text('SGST (9%)', 370, subtotalPosition + 45, { width: 90, align: 'right' })
            .text((order.taxPrice / 2).toFixed(2), 0, subtotalPosition + 45, { align: 'right' });

        doc.fontSize(12)
            .text('Total', 370, subtotalPosition + 65, { width: 90, align: 'right' })
            .text(order.totalPrice.toFixed(2), 0, subtotalPosition + 65, { align: 'right' });

        // Footer
        doc.fontSize(10)
            .text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

        doc.end();

        stream.on('finish', () => resolve(true));
        stream.on('error', (err) => reject(err));
    });
};
